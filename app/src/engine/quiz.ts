import type {Bank} from '../data/bank';
import {resolveIds} from '../data/bank';
import type {ExamConfig, Question, StateCode, TopicId, TrackId} from '../data/types';
import {defineStrings, tr} from '../i18n';
import type {MarathonState} from '../store/progress';
import {dayKey} from './dates';
import {createRng, hashString, Rng, sample, shuffle} from './random';
import {isDue, isMistake, knowledge, QStat} from './srs';

export type QuizMode =
  | 'practice'
  | 'exam'
  | 'marathon'
  | 'mistakes'
  | 'bookmarks'
  | 'due'
  | 'hardest'
  | 'signs'
  | 'daily'
  | 'survival'
  | 'speed'
  | 'state'
  | 'custom';

/** What the user asked for (serializable navigation param). */
export interface QuizSpec {
  mode: QuizMode;
  title?: string;
  topic?: TopicId;
  examId?: string;
  questionIds?: string[];
  count?: number;
}

export interface QuizSession {
  id: string;
  spec: QuizSpec;
  track: TrackId;
  state: StateCode;
  title: string;
  questionIds: string[];
  /** Per question: original choice indexes in display order. */
  orders: number[][];
  /** Per question: chosen ORIGINAL choice index, or null if unanswered. */
  answers: (number | null)[];
  /** 'instant' shows right/wrong + explanation after each answer; 'end' only at the end (exams). */
  feedback: 'instant' | 'end';
  exam: ExamConfig | null;
  /** Passing score scaled to the questions actually available (exam only). */
  passingScore: number | null;
  timeLimitSec: number | null;
  startedAt: number;
  finishedAt: number | null;
  endedEarly: boolean;
  timedOut: boolean;
  /** Marathons save progress under this key and can be resumed. */
  marathonKey: string | null;
  /** Index to start at (resumed marathons). */
  startIndex: number;
  /** Marathon totals from before this session (resumed) — added to this session's answers. */
  marathonBase: {correct: number; wrong: number; startedAt: number} | null;
  /** Survival mode: wrong answers allowed before the run ends (null = unlimited). */
  lives: number | null;
  /** Sectioned exams (NY, IL, GA, NC): the first `signsCount` questions are the road-signs part. */
  signsCount: number | null;
}

export interface BuildContext {
  bank: Bank;
  stats: Record<string, QStat>;
  bookmarks: Record<string, number>;
  shuffleChoices: boolean;
  examTimer: boolean;
  exam?: ExamConfig;
  marathon?: MarathonState;
  now: number;
  seed: number;
}

export const DEFAULT_COUNTS: Record<QuizMode, number> = {
  practice: 20,
  exam: 0,
  marathon: 0,
  mistakes: 50,
  bookmarks: 100,
  due: 30,
  hardest: 20,
  signs: 20,
  daily: 10,
  survival: 250,
  speed: 120,
  state: 25,
  custom: 0,
};

/** Survival: wrong answers allowed. Speed round: seconds on the clock. */
export const SURVIVAL_LIVES = 3;
export const SPEED_ROUND_SECONDS = 120;

export const MODE_TITLES: Record<QuizMode, string> = {
  practice: 'Practice Test',
  exam: 'Exam Simulator',
  marathon: 'Marathon',
  mistakes: 'Mistakes Review',
  bookmarks: 'Saved Questions',
  due: 'Smart Review',
  hardest: 'Hardest Questions',
  signs: 'Road Signs Quiz',
  daily: 'Daily Challenge',
  survival: 'Survival',
  speed: 'Speed Round',
  state: 'State Laws',
  custom: 'Practice',
};

const MODE_TITLES_ES: Record<QuizMode, string> = {
  practice: 'Examen de práctica',
  exam: 'Simulador de examen',
  marathon: 'Maratón',
  mistakes: 'Repaso de errores',
  bookmarks: 'Preguntas guardadas',
  due: 'Repaso inteligente',
  hardest: 'Preguntas más difíciles',
  signs: 'Prueba de señales de tránsito',
  daily: 'Reto diario',
  survival: 'Supervivencia',
  speed: 'Ronda rápida',
  state: 'Leyes estatales',
  custom: 'Práctica',
};

const TITLES = defineStrings<Record<QuizMode, string>>(MODE_TITLES, MODE_TITLES_ES);

/** Localized title of a quiz mode (MODE_TITLES stays English). */
export function modeTitle(mode: QuizMode): string {
  return tr(TITLES)[mode];
}

export function marathonKey(track: TrackId, state: StateCode, topic?: TopicId): string {
  return `${track}:${state}:${topic ?? 'all'}`;
}

function topicPool(bank: Bank, topic?: TopicId): Question[] {
  return topic ? bank.byTopic.get(topic) ?? [] : bank.questions;
}

/**
 * Adaptive selection: mistakes and unseen questions first, then due reviews,
 * then weak ones, with randomness so repeated tests feel fresh.
 */
function pickAdaptive(pool: Question[], count: number, stats: Record<string, QStat>, now: number, rng: Rng): Question[] {
  const scored = pool.map(q => {
    const s = stats[q.id];
    let p: number;
    if (!s || s.a === 0) {
      p = 2.6;
    } else if (isMistake(s)) {
      p = 3;
    } else if (isDue(s, now)) {
      p = 2.2;
    } else {
      p = 1.6 * (1 - knowledge(s, 0.6));
    }
    return {q, score: p + rng() * 1.4};
  });
  scored.sort((a, b) => b.score - a.score);
  return shuffle(
    scored.slice(0, count).map(x => x.q),
    rng,
  );
}

/** Real-test-like mix: ~20% sign questions, up to ~30% state-specific, the rest general. */
function pickExam(bank: Bank, exam: ExamConfig, rng: Rng): {questions: Question[]; signsCount: number | null} {
  const n = exam.questions;
  if (exam.topic) {
    return {questions: sample(bank.byTopic.get(exam.topic) ?? [], n, rng), signsCount: null};
  }
  if (exam.signs && exam.track === 'car') {
    // Separately scored road-signs part first (like the real test), then the rules part.
    const signsPart = sample(bank.signQuestions, exam.signs.questions, rng);
    const used = new Set(signsPart.map(q => q.id));
    const rulesN = n - signsPart.length;
    const stateRules = sample(
      bank.stateSpecific.filter(q => !q.sign),
      Math.round(rulesN * 0.35),
      rng,
    );
    stateRules.forEach(q => used.add(q.id));
    const general = sample(
      bank.questions.filter(q => !q.sign && !used.has(q.id)),
      rulesN - stateRules.length,
      rng,
    );
    return {questions: [...signsPart, ...shuffle([...stateRules, ...general], rng)], signsCount: signsPart.length};
  }
  const signs = exam.track === 'car' ? bank.signQuestions : [];
  const stateQs = bank.stateSpecific.filter(q => !q.sign);
  const used = new Set<string>();
  const take = (from: Question[], k: number) => {
    const out = sample(
      from.filter(q => !used.has(q.id)),
      k,
      rng,
    );
    out.forEach(q => used.add(q.id));
    return out;
  };
  const picked = [
    ...take(signs, Math.round(n * 0.2)),
    ...take(stateQs, Math.round(n * 0.3)),
  ];
  picked.push(...take(bank.questions, n - picked.length));
  return {questions: shuffle(picked, rng), signsCount: null};
}

export function buildSession(spec: QuizSpec, ctx: BuildContext): QuizSession {
  const {bank, stats, now} = ctx;
  const rng = createRng(ctx.seed);
  const count = spec.count ?? DEFAULT_COUNTS[spec.mode];
  let questions: Question[] = [];
  let exam: ExamConfig | null = null;
  let mKey: string | null = null;
  let startIndex = 0;
  let marathonBase: QuizSession['marathonBase'] = null;
  let signsCount: number | null = null;

  switch (spec.mode) {
    case 'exam': {
      exam = ctx.exam ?? null;
      if (exam) {
        const picked = pickExam(bank, exam, rng);
        questions = picked.questions;
        signsCount = picked.signsCount;
      }
      break;
    }
    case 'practice':
      questions = pickAdaptive(topicPool(bank, spec.topic), count, stats, now, rng);
      break;
    case 'marathon': {
      mKey = marathonKey(bank.track, bank.state, spec.topic);
      const saved = ctx.marathon;
      const savedQs = saved ? resolveIds(bank, saved.ids) : [];
      if (saved && savedQs.length === saved.ids.length && saved.index < saved.ids.length) {
        questions = savedQs;
        startIndex = saved.index;
        marathonBase = {correct: saved.correct, wrong: saved.wrong, startedAt: saved.startedAt};
      } else {
        questions = shuffle(topicPool(bank, spec.topic), rng);
        marathonBase = {correct: 0, wrong: 0, startedAt: now};
      }
      break;
    }
    case 'mistakes':
      questions = shuffle(
        topicPool(bank, spec.topic).filter(q => isMistake(stats[q.id])),
        rng,
      ).slice(0, count);
      break;
    case 'bookmarks':
      questions = topicPool(bank, spec.topic)
        .filter(q => ctx.bookmarks[q.id])
        .sort((a, b) => ctx.bookmarks[b.id] - ctx.bookmarks[a.id])
        .slice(0, count);
      break;
    case 'due':
      questions = topicPool(bank, spec.topic)
        .filter(q => isDue(stats[q.id], now))
        .sort((a, b) => stats[a.id].d - stats[b.id].d)
        .slice(0, count);
      questions = shuffle(questions, rng);
      break;
    case 'hardest': {
      const pool = topicPool(bank, spec.topic);
      const missed = pool
        .filter(q => (stats[q.id]?.w ?? 0) > 0)
        .sort((a, b) => {
          const sa = stats[a.id];
          const sb = stats[b.id];
          return sb.w / sb.a - sa.w / sa.a || sb.w - sa.w;
        });
      const hard = pool.filter(q => q.difficulty === 3 && !missed.includes(q));
      questions = shuffle([...missed, ...shuffle(hard, rng)].slice(0, count), rng);
      break;
    }
    case 'signs':
      questions = pickAdaptive(bank.signQuestions, count, stats, now, rng);
      break;
    case 'state':
      questions = pickAdaptive(bank.stateSpecific, count, stats, now, rng);
      break;
    case 'daily': {
      const dayRng = createRng(hashString(`${dayKey(now)}:${bank.track}:${bank.state}`));
      questions = sample(bank.questions, count, dayRng);
      break;
    }
    case 'survival':
    case 'speed':
      questions = shuffle(topicPool(bank, spec.topic), rng).slice(0, count);
      break;
    case 'custom':
      questions = resolveIds(bank, spec.questionIds ?? []);
      break;
  }

  const orders = questions.map(q => {
    const idx = q.choices.map((_, i) => i);
    return ctx.shuffleChoices && !q.lockOrder ? shuffle(idx, rng) : idx;
  });

  const passingScore = exam
    ? Math.min(questions.length, Math.ceil((exam.passingScore * questions.length) / Math.max(1, exam.questions)))
    : null;

  return {
    id: `${now.toString(36)}-${ctx.seed.toString(36)}`,
    spec,
    track: bank.track,
    state: bank.state,
    title: spec.title ?? exam?.title ?? modeTitle(spec.mode),
    questionIds: questions.map(q => q.id),
    orders,
    answers: questions.map(() => null),
    feedback: spec.mode === 'exam' ? 'end' : 'instant',
    exam,
    passingScore,
    timeLimitSec:
      spec.mode === 'speed'
        ? SPEED_ROUND_SECONDS
        : exam && ctx.examTimer && exam.timeLimitMinutes
          ? exam.timeLimitMinutes * 60
          : null,
    startedAt: now,
    finishedAt: null,
    endedEarly: false,
    timedOut: false,
    marathonKey: mKey,
    startIndex,
    marathonBase,
    lives: spec.mode === 'survival' ? SURVIVAL_LIVES : null,
    signsCount,
  };
}

/** How many questions a mode would currently offer (for badges like "Mistakes (12)"). */
export function poolSize(mode: QuizMode, bank: Bank, stats: Record<string, QStat>, bookmarks: Record<string, number>, now: number, topic?: TopicId): number {
  const pool = topicPool(bank, topic);
  switch (mode) {
    case 'mistakes':
      return pool.filter(q => isMistake(stats[q.id])).length;
    case 'bookmarks':
      return pool.filter(q => bookmarks[q.id]).length;
    case 'due':
      return pool.filter(q => isDue(stats[q.id], now)).length;
    case 'hardest':
      return pool.filter(q => (stats[q.id]?.w ?? 0) > 0 || q.difficulty === 3).length;
    case 'signs':
      return bank.signQuestions.length;
    case 'state':
      return bank.stateSpecific.length;
    default:
      return pool.length;
  }
}

export interface SessionResult {
  total: number;
  answered: number;
  correct: number;
  wrong: number;
  skipped: number;
  /** correct / total, 0–100 */
  percent: number;
  passed: boolean | null;
  passingScore: number | null;
  byTopic: Partial<Record<TopicId, [number, number]>>;
  wrongIds: string[];
  durationSec: number;
  /** Sectioned exams only. `need` null = no separate minimum for that part. */
  sections: {signs: SectionScore; rules: SectionScore} | null;
}

export interface SectionScore {
  correct: number;
  total: number;
  need: number | null;
}

/** Correct answers inside [from, to) of the session. */
function correctIn(session: QuizSession, bank: Bank, from: number, to: number): {correct: number; wrong: number} {
  let correct = 0;
  let wrong = 0;
  for (let i = from; i < to; i++) {
    const a = session.answers[i];
    if (a === null) {
      continue;
    }
    if (a === bank.byId.get(session.questionIds[i])?.answer) {
      correct++;
    } else {
      wrong++;
    }
  }
  return {correct, wrong};
}

function sectionScores(session: QuizSession, bank: Bank): {signs: SectionScore; rules: SectionScore} | null {
  if (session.signsCount === null || !session.exam) {
    return null;
  }
  const total = session.questionIds.length;
  const k = session.signsCount;
  const needSigns = session.exam.signs?.passingScore ?? null;
  const needRules = session.exam.rulesPassingScore ?? null;
  return {
    signs: {correct: correctIn(session, bank, 0, k).correct, total: k, need: needSigns === null ? null : Math.min(needSigns, k)},
    rules: {correct: correctIn(session, bank, k, total).correct, total: total - k, need: needRules === null ? null : Math.min(needRules, total - k)},
  };
}

const sectionsPassed = (s: {signs: SectionScore; rules: SectionScore} | null) =>
  !s || ((s.signs.need === null || s.signs.correct >= s.signs.need) && (s.rules.need === null || s.rules.correct >= s.rules.need));

export function scoreSession(session: QuizSession, bank: Bank, now: number = Date.now()): SessionResult {
  let correct = 0;
  let answered = 0;
  const byTopic: Partial<Record<TopicId, [number, number]>> = {};
  const wrongIds: string[] = [];
  session.questionIds.forEach((id, i) => {
    const q = bank.byId.get(id);
    const a = session.answers[i];
    if (!q) {
      return;
    }
    const t = byTopic[q.topic] ?? [0, 0];
    if (a !== null) {
      answered++;
      t[1]++;
      if (a === q.answer) {
        correct++;
        t[0]++;
      } else {
        wrongIds.push(id);
      }
    }
    byTopic[q.topic] = t;
  });
  const total = session.questionIds.length;
  const passingScore = session.passingScore;
  const sections = sectionScores(session, bank);
  return {
    total,
    answered,
    correct,
    wrong: answered - correct,
    skipped: total - answered,
    percent: total ? Math.round((correct / total) * 100) : 0,
    passed: passingScore === null ? null : correct >= passingScore && sectionsPassed(sections),
    passingScore,
    byTopic,
    wrongIds,
    durationSec: Math.round(((session.finishedAt ?? now) - session.startedAt) / 1000),
    sections,
  };
}

/** For "realistic" exams: has the outcome already been decided? */
export function examDecided(session: QuizSession, bank: Bank): 'pass' | 'fail' | null {
  if (session.passingScore === null) {
    return null;
  }
  let correct = 0;
  let wrong = 0;
  session.questionIds.forEach((id, i) => {
    const a = session.answers[i];
    if (a === null) {
      return;
    }
    if (a === bank.byId.get(id)?.answer) {
      correct++;
    } else {
      wrong++;
    }
  });
  const total = session.questionIds.length;
  const sections = sectionScores(session, bank);
  if (sections && session.signsCount !== null) {
    const k = session.signsCount;
    const signsWrong = correctIn(session, bank, 0, k).wrong;
    const rulesWrong = correctIn(session, bank, k, total).wrong;
    if (
      (sections.signs.need !== null && signsWrong > sections.signs.total - sections.signs.need) ||
      (sections.rules.need !== null && rulesWrong > sections.rules.total - sections.rules.need)
    ) {
      return 'fail';
    }
  }
  if (wrong > total - session.passingScore) {
    return 'fail';
  }
  if (correct >= session.passingScore && sectionsPassed(sections)) {
    return 'pass';
  }
  return null;
}
