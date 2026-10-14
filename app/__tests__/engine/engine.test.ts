import {clearBankCache, getBank, searchBank} from '../../src/data/bank';
import {getExamConfig, getExamConfigs} from '../../src/data/exams';
import {ACHIEVEMENTS, newlyEarned} from '../../src/engine/achievements';
import {currentStreak, dayKey, daysUntil, formatClock, lastNDays, longestStreak} from '../../src/engine/dates';
import {buildSession, examDecided, poolSize, QuizSpec, scoreSession, SPEED_ROUND_SECONDS, SURVIVAL_LIVES} from '../../src/engine/quiz';
import {createRng, shuffle} from '../../src/engine/random';
import {binomialAtLeast, computeReadiness} from '../../src/engine/readiness';
import {applyAnswer, isDue, isMastered, isMistake, QStat} from '../../src/engine/srs';
import {driveLogCsv, driveTotals, requirementFromFact} from '../../src/store/driveLog';

jest.mock('../../src/content', () => require('../fixtures/content'));

const NOW = new Date(2026, 9, 13, 18, 0, 0).getTime();
const DAY = 24 * 60 * 60 * 1000;

beforeEach(() => clearBankCache());

function ctx(extra: Partial<Parameters<typeof buildSession>[1]> = {}) {
  return {
    bank: getBank('car', 'CA'),
    stats: {} as Record<string, QStat>,
    bookmarks: {} as Record<string, number>,
    shuffleChoices: true,
    examTimer: true,
    now: NOW,
    seed: 42,
    ...extra,
  };
}

describe('srs', () => {
  test('correct answers climb boxes, wrong answers reset and mark a mistake', () => {
    let s = applyAnswer(undefined, true, NOW);
    expect(s).toMatchObject({a: 1, c: 1, s: 1, w: 0, b: 1});
    s = applyAnswer(s, true, NOW + 1);
    s = applyAnswer(s, true, NOW + 2);
    expect(s.b).toBe(3);
    expect(isMastered(s)).toBe(true);
    s = applyAnswer(s, false, NOW + 3);
    expect(s).toMatchObject({s: 0, w: 1, b: 1});
    expect(isMistake(s)).toBe(true);
    s = applyAnswer(s, true, NOW + 4);
    expect(isMistake(s)).toBe(true);
    s = applyAnswer(s, true, NOW + 5);
    expect(isMistake(s)).toBe(false);
  });

  test('due dates follow the box interval', () => {
    const s = applyAnswer(applyAnswer(undefined, true, NOW), true, NOW);
    expect(isDue(s, NOW)).toBe(false);
    expect(isDue(s, NOW + DAY + 1)).toBe(true);
  });
});

describe('bank', () => {
  test('includes universal + only the selected state questions', () => {
    const bank = getBank('car', 'CA');
    expect(bank.questions.length).toBe(12 + 3);
    expect(bank.stateSpecific.map(q => q.id)).toEqual(['t.ca.1', 't.ca.2', 't.ca.3']);
    expect(getBank('car', 'TX').questions.length).toBe(12);
    expect(bank.signQuestions.length).toBe(2);
    expect(getBank('motorcycle', 'CA').questions.every(q => q.track === 'motorcycle')).toBe(true);
  });

  test('search ranks prompt matches', () => {
    const bank = getBank('car', 'CA');
    expect(searchBank(bank, 'sign mean').map(q => q.id)).toContain('t.car.sign.1');
    expect(searchBank(bank, '')).toEqual([]);
  });
});

describe('exams', () => {
  test('car exam uses the state format', () => {
    const e = getExamConfig('car', 'CA');
    expect(e).toMatchObject({questions: 10, passingScore: 8, timeLimitMinutes: 20});
  });
  test('unknown state falls back to a typical format', () => {
    expect(getExamConfig('car', 'WY').questions).toBeGreaterThan(0);
  });
  test('CDL has one exam per module at 80%', () => {
    const all = getExamConfigs('cdl', 'CA');
    expect(all).toHaveLength(8);
    const gk = all.find(x => x.topic === 'cdl-general')!;
    expect(gk.passingScore).toBe(Math.ceil(gk.questions * 0.8));
  });
});

describe('buildSession', () => {
  const modes: QuizSpec['mode'][] = ['practice', 'marathon', 'mistakes', 'bookmarks', 'due', 'hardest', 'signs', 'daily', 'survival', 'speed', 'state', 'custom'];
  test.each(modes)('%s builds a consistent session', mode => {
    const s = buildSession({mode, questionIds: ['t.car.row.1', 'nope']}, ctx());
    expect(s.questionIds.length).toBe(s.orders.length);
    expect(s.answers.every(a => a === null)).toBe(true);
    s.orders.forEach((o, i) => {
      const q = getBank('car', 'CA').byId.get(s.questionIds[i])!;
      expect([...o].sort()).toEqual(q.choices.map((_, k) => k));
    });
    expect(s.feedback).toBe('instant');
  });

  test('exam mode scales passing score to available questions and is timed', () => {
    const exam = getExamConfig('car', 'CA');
    const s = buildSession({mode: 'exam'}, ctx({exam}));
    expect(s.feedback).toBe('end');
    expect(s.questionIds.length).toBe(10);
    expect(new Set(s.questionIds).size).toBe(10);
    expect(s.passingScore).toBe(8);
    expect(s.timeLimitSec).toBe(20 * 60);
    expect(buildSession({mode: 'exam'}, ctx({exam, examTimer: false})).timeLimitSec).toBeNull();
  });

  test('lockOrder questions keep their order', () => {
    const s = buildSession({mode: 'custom', questionIds: ['t.car.tf.1']}, ctx());
    expect(s.orders[0]).toEqual([0, 1]);
  });

  test('mistakes / bookmarks / due pools come from stats', () => {
    const wrong = applyAnswer(undefined, false, NOW - 2 * DAY);
    const stats = {'t.car.row.1': wrong};
    expect(buildSession({mode: 'mistakes'}, ctx({stats})).questionIds).toEqual(['t.car.row.1']);
    expect(buildSession({mode: 'due'}, ctx({stats})).questionIds).toEqual(['t.car.row.1']);
    expect(buildSession({mode: 'bookmarks'}, ctx({bookmarks: {'t.car.park.1': 1}})).questionIds).toEqual(['t.car.park.1']);
    expect(poolSize('mistakes', getBank('car', 'CA'), stats, {}, NOW)).toBe(1);
  });

  test('marathon resumes saved progress', () => {
    const bank = getBank('car', 'CA');
    const ids = bank.questions.map(q => q.id);
    const s = buildSession({mode: 'marathon'}, ctx({marathon: {ids, index: 5, correct: 4, wrong: 1, startedAt: NOW - DAY}}));
    expect(s.questionIds).toEqual(ids);
    expect(s.startIndex).toBe(5);
    expect(s.marathonBase).toEqual({correct: 4, wrong: 1, startedAt: NOW - DAY});
    expect(s.marathonKey).toBe('car:CA:all');
  });

  test('daily challenge is stable within a day', () => {
    const a = buildSession({mode: 'daily'}, ctx({seed: 1}));
    const b = buildSession({mode: 'daily'}, ctx({seed: 999}));
    expect(a.questionIds).toEqual(b.questionIds);
  });

  test('state mode only uses state-specific questions', () => {
    const s = buildSession({mode: 'state'}, ctx());
    expect(s.questionIds.sort()).toEqual(['t.ca.1', 't.ca.2', 't.ca.3']);
    expect(poolSize('state', getBank('car', 'CA'), {}, {}, NOW)).toBe(3);
    expect(poolSize('state', getBank('car', 'TX'), {}, {}, NOW)).toBe(0);
  });

  test('survival has lives, speed round has a clock', () => {
    expect(buildSession({mode: 'survival'}, ctx()).lives).toBe(SURVIVAL_LIVES);
    expect(buildSession({mode: 'speed'}, ctx()).timeLimitSec).toBe(SPEED_ROUND_SECONDS);
  });
});

describe('scoring', () => {
  test('scores by original choice index and reports pass/fail + topics', () => {
    const exam = getExamConfig('car', 'CA');
    const bank = getBank('car', 'CA');
    const s = buildSession({mode: 'exam'}, ctx({exam}));
    s.answers = s.questionIds.map((id, i) => (i < 8 ? bank.byId.get(id)!.answer : (bank.byId.get(id)!.answer + 1) % bank.byId.get(id)!.choices.length));
    const r = scoreSession(s, bank, NOW + 60_000);
    expect(r).toMatchObject({total: 10, answered: 10, correct: 8, wrong: 2, passed: true, passingScore: 8, percent: 80});
    expect(r.wrongIds).toHaveLength(2);
    expect(r.durationSec).toBe(60);
    const topicTotals = Object.values(r.byTopic).reduce((n, t) => n + (t ? t[1] : 0), 0);
    expect(topicTotals).toBe(10);
  });

  test('realistic exam decides early', () => {
    const exam = getExamConfig('car', 'CA');
    const bank = getBank('car', 'CA');
    const s = buildSession({mode: 'exam'}, ctx({exam}));
    const wrongAt = (i: number) => (bank.byId.get(s.questionIds[i])!.answer + 1) % bank.byId.get(s.questionIds[i])!.choices.length;
    s.answers[0] = wrongAt(0);
    s.answers[1] = wrongAt(1);
    expect(examDecided(s, bank)).toBeNull();
    s.answers[2] = wrongAt(2);
    expect(examDecided(s, bank)).toBe('fail');
  });
});

describe('sectioned exams (NY/IL/GA/NC style)', () => {
  const sectioned = () => ({
    ...getExamConfig('car', 'CA'),
    questions: 10,
    passingScore: 7,
    signs: {questions: 2, passingScore: 2},
    rulesPassingScore: null,
  });

  test('signs part comes first and is sized from the config', () => {
    const exam = sectioned();
    const bank = getBank('car', 'CA');
    const s = buildSession({mode: 'exam'}, ctx({exam}));
    expect(s.signsCount).toBe(2);
    expect(s.questionIds.slice(0, 2).every(id => !!bank.byId.get(id)!.sign)).toBe(true);
    expect(s.questionIds.slice(2).every(id => !bank.byId.get(id)!.sign)).toBe(true);
  });

  test('passing overall but failing the signs part is a fail', () => {
    const exam = sectioned();
    const bank = getBank('car', 'CA');
    const s = buildSession({mode: 'exam'}, ctx({exam}));
    const right = (i: number) => bank.byId.get(s.questionIds[i])!.answer;
    const wrong = (i: number) => (right(i) + 1) % bank.byId.get(s.questionIds[i])!.choices.length;
    s.answers = s.questionIds.map((_, i) => (i === 0 ? wrong(i) : right(i)));
    const r = scoreSession(s, bank, NOW);
    expect(r.correct).toBe(9);
    expect(r.sections).toEqual({signs: {correct: 1, total: 2, need: 2}, rules: {correct: 8, total: 8, need: null}});
    expect(r.passed).toBe(false);
    expect(examDecided(s, bank)).toBe('fail');
    s.answers[0] = right(0);
    expect(scoreSession(s, bank, NOW).passed).toBe(true);
  });

  test('a separately scored rules part must also be passed', () => {
    const exam = {...sectioned(), rulesPassingScore: 7};
    const bank = getBank('car', 'CA');
    const s = buildSession({mode: 'exam'}, ctx({exam}));
    const right = (i: number) => bank.byId.get(s.questionIds[i])!.answer;
    const wrong = (i: number) => (right(i) + 1) % bank.byId.get(s.questionIds[i])!.choices.length;
    s.answers = s.questionIds.map((_, i) => (i >= 2 && i < 4 ? wrong(i) : right(i)));
    const r = scoreSession(s, bank, NOW);
    expect(r.sections!.rules).toEqual({correct: 6, total: 8, need: 7});
    expect(r.passed).toBe(false);
  });

  test('readiness accounts for the signs part', () => {
    const bank = getBank('car', 'CA');
    const stats: Record<string, QStat> = {};
    for (const q of bank.questions) {
      let st = applyAnswer(undefined, true, NOW);
      st = applyAnswer(st, true, NOW);
      st = applyAnswer(st, true, NOW);
      stats[q.id] = st;
    }
    for (const q of bank.signQuestions) {
      stats[q.id] = applyAnswer(stats[q.id], false, NOW); // weak on signs
    }
    const plain = computeReadiness(bank, stats, {...sectioned(), signs: null});
    const withSigns = computeReadiness(bank, stats, sectioned());
    expect(withSigns.passProbability).toBeLessThan(plain.passProbability);
  });
});

describe('readiness', () => {
  test('binomial tail is correct at edges and a known value', () => {
    expect(binomialAtLeast(10, 0, 0.5)).toBe(1);
    expect(binomialAtLeast(10, 11, 0.9)).toBe(0);
    expect(binomialAtLeast(10, 10, 0.5)).toBeCloseTo(1 / 1024, 6);
    expect(binomialAtLeast(2, 1, 0.5)).toBeCloseTo(0.75, 6);
  });

  test('a beginner is not ready; mastering everything makes you ready', () => {
    const bank = getBank('car', 'CA');
    const exam = getExamConfig('car', 'CA');
    const fresh = computeReadiness(bank, {}, exam);
    expect(fresh.passProbability).toBeLessThan(0.4);
    expect(fresh.label).toBe('Just starting');
    const stats: Record<string, QStat> = {};
    for (const q of bank.questions) {
      let s = applyAnswer(undefined, true, NOW);
      s = applyAnswer(s, true, NOW);
      s = applyAnswer(s, true, NOW);
      s = applyAnswer(s, true, NOW);
      stats[q.id] = s;
    }
    const pro = computeReadiness(bank, stats, exam);
    expect(pro.passProbability).toBeGreaterThan(0.9);
    expect(pro.label).toBe('Ready to pass');
    expect(pro.coverage).toBe(1);
  });
});

describe('dates', () => {
  test('streaks', () => {
    const days = {[dayKey(NOW)]: 1, [dayKey(NOW - DAY)]: 1, [dayKey(NOW - 2 * DAY)]: 1, [dayKey(NOW - 4 * DAY)]: 1};
    expect(currentStreak(days, NOW)).toBe(3);
    expect(currentStreak({[dayKey(NOW - DAY)]: 1}, NOW)).toBe(1);
    expect(longestStreak(days)).toBe(3);
    expect(lastNDays(3, NOW)).toEqual([dayKey(NOW - 2 * DAY), dayKey(NOW - DAY), dayKey(NOW)]);
    expect(daysUntil(dayKey(NOW + 5 * DAY), NOW)).toBe(5);
    expect(formatClock(125)).toBe('2:05');
  });

  test('rng shuffle is deterministic per seed', () => {
    expect(shuffle([1, 2, 3, 4, 5], createRng(7))).toEqual(shuffle([1, 2, 3, 4, 5], createRng(7)));
  });
});

describe('achievements', () => {
  test('first answer + streak achievements unlock from progress', () => {
    const bank = getBank('car', 'CA');
    const earned = newlyEarned(
      {
        stats: {},
        exams: [],
        days: {[dayKey(NOW)]: {q: 25, c: 20, sec: 600, x: 0}, [dayKey(NOW - DAY)]: {q: 5, c: 5, sec: 60, x: 0}, [dayKey(NOW - 2 * DAY)]: {q: 5, c: 5, sec: 60, x: 0}},
        signLevels: {},
        lessonsRead: {},
        clearedMistakes: 0,
        totalAnswered: 35,
        marathonsFinished: 0,
        dailyGoal: 20,
        bank,
        passProbability: 0.1,
        now: NOW,
      },
      {},
    ).map(a => a.id);
    expect(earned).toEqual(expect.arrayContaining(['first-answer', 'streak-3', 'daily-goal']));
    expect(earned).not.toContain('answers-100');
    expect(new Set(ACHIEVEMENTS.map(a => a.id)).size).toBe(ACHIEVEMENTS.length);
  });
});

describe('drive log', () => {
  test('parses supervised hours requirement from a fact', () => {
    const fact = {key: 'supervised_driving_hours' as const, value: '50 hours (10 at night)', detail: 'At least 50 hours, including 10 hours at night.', number: 50, unit: 'hours', source: {url: '', page: 1, quote: ''}};
    expect(requirementFromFact(fact)).toEqual({hours: 50, nightHours: 10});
    expect(requirementFromFact(undefined)).toEqual({hours: null, nightHours: null});
  });

  test('totals and CSV export', () => {
    const entries = [
      {id: 'a', date: '2026-10-12', minutes: 60, nightMinutes: 30, conditions: ['Rain'], supervisor: 'Mom', notes: 'said "good"', createdAt: 1},
      {id: 'b', date: '2026-10-11', minutes: 45, nightMinutes: 0, conditions: [], supervisor: 'Dad', notes: '', createdAt: 2},
    ];
    expect(driveTotals(entries)).toEqual({minutes: 105, nightMinutes: 30, drives: 2});
    const csv = driveLogCsv(entries);
    expect(csv.split('\n')).toHaveLength(3);
    expect(csv).toContain('"said ""good"""');
  });
});
