/**
 * Pure, UI-free helpers shared by the Home and Practice screens.
 * Everything here is deterministic and cheap enough to run inside useMemo.
 */
import type {Bank} from '../../../data/bank';
import type {Question, StateCode, TopicId, TrackId} from '../../../data/types';
import {dayKey, parseDayKey} from '../../../engine/dates';
import {buildSession, marathonKey, poolSize, QuizMode} from '../../../engine/quiz';
import {createRng, hashString, pick, shuffle} from '../../../engine/random';
import {isDue, isMastered, isMistake, QStat} from '../../../engine/srs';
import type {MarathonState} from '../../../store/progress';

/** Learning status of one question, shown next to it in lists. */
export type QuestionStatus = 'new' | 'mistake' | 'learning' | 'mastered';

export function questionStatus(s: QStat | undefined): QuestionStatus {
  if (!s || s.a === 0) {
    return 'new';
  }
  if (isMistake(s)) {
    return 'mistake';
  }
  if (isMastered(s)) {
    return 'mastered';
  }
  return 'learning';
}

/** Sort weight: what the learner should look at first. */
const STATUS_ORDER: Record<QuestionStatus, number> = {mistake: 0, new: 1, learning: 2, mastered: 3};

/** Mistakes first, then unseen, then in-progress, then mastered (stable within each group). */
export function sortByStatus(questions: Question[], stats: Record<string, QStat>): Question[] {
  return questions
    .map((q, i) => ({q, i, w: STATUS_ORDER[questionStatus(stats[q.id])]}))
    .sort((a, b) => a.w - b.w || a.i - b.i)
    .map(x => x.q);
}

export interface TopicProgress {
  topic: TopicId;
  total: number;
  /** Questions answered at least once. */
  seen: number;
  mastered: number;
  mistakes: number;
  due: number;
  /** Share of all attempts answered correctly, or null if never practiced. */
  accuracy: number | null;
}

export function topicProgress(topic: TopicId, questions: Question[], stats: Record<string, QStat>, now: number): TopicProgress {
  let seen = 0;
  let mastered = 0;
  let mistakes = 0;
  let due = 0;
  let attempts = 0;
  let correct = 0;
  for (const q of questions) {
    const s = stats[q.id];
    if (!s || s.a === 0) {
      continue;
    }
    seen++;
    attempts += s.a;
    correct += s.c;
    if (isMastered(s)) {
      mastered++;
    }
    if (isMistake(s)) {
      mistakes++;
    }
    if (isDue(s, now)) {
      due++;
    }
  }
  return {
    topic,
    total: questions.length,
    seen,
    mastered,
    mistakes,
    due,
    accuracy: attempts ? correct / attempts : null,
  };
}

/** Progress for every topic that has questions in the bank. */
export function topicProgressMap(bank: Bank, stats: Record<string, QStat>, now: number): Map<TopicId, TopicProgress> {
  const out = new Map<TopicId, TopicProgress>();
  for (const [topic, qs] of bank.byTopic) {
    out.set(topic, topicProgress(topic, qs, stats, now));
  }
  return out;
}

export interface ModeCounts {
  total: number;
  mistakes: number;
  bookmarks: number;
  due: number;
  hardest: number;
  signs: number;
  state: number;
}

/** Pool sizes for the mode cards ("Mistakes (12)", "Smart Review (4 due)"...). */
export function modeCounts(
  bank: Bank,
  stats: Record<string, QStat>,
  bookmarks: Record<string, number>,
  now: number,
  topic?: TopicId,
): ModeCounts {
  const size = (mode: QuizMode) => poolSize(mode, bank, stats, bookmarks, now, topic);
  return {
    total: size('practice'),
    mistakes: size('mistakes'),
    bookmarks: size('bookmarks'),
    due: size('due'),
    hardest: size('hardest'),
    signs: size('signs'),
    state: size('state'),
  };
}

/** Local midnight (ms) of the day containing `now`. */
export function startOfDay(now: number): number {
  return parseDayKey(dayKey(now)).getTime();
}

/** Today's Daily Challenge question ids (same deterministic pick the quiz engine makes). */
export function dailyChallengeIds(bank: Bank, now: number): string[] {
  if (!bank.questions.length) {
    return [];
  }
  return buildSession(
    {mode: 'daily'},
    {bank, stats: {}, bookmarks: {}, shuffleChoices: false, examTimer: false, now, seed: 1},
  ).questionIds;
}

/** True when every question of today's challenge was answered today. */
export function answeredAllToday(ids: string[], stats: Record<string, QStat>, now: number): boolean {
  if (!ids.length) {
    return false;
  }
  const start = startOfDay(now);
  return ids.every(id => (stats[id]?.t ?? 0) >= start);
}

export interface QuestionOfTheDay {
  question: Question;
  /** Original choice indexes in display order. */
  order: number[];
}

/**
 * Question of the day: deterministic by date using the Daily Challenge seed.
 * (The first draw of that seed ends up outside the challenge's own picks.)
 */
export function questionOfTheDay(bank: Bank, key: string): QuestionOfTheDay | null {
  if (!bank.questions.length) {
    return null;
  }
  const rng = createRng(hashString(`${key}:${bank.track}:${bank.state}`));
  const question = pick(bank.questions, rng);
  if (!question) {
    return null;
  }
  const idx = question.choices.map((_, i) => i);
  return {question, order: question.lockOrder ? idx : shuffle(idx, rng)};
}

export interface ActiveMarathon {
  key: string;
  /** undefined = the all-questions marathon. */
  topic?: TopicId;
  state: MarathonState;
}

function isUnfinished(m: MarathonState | undefined): m is MarathonState {
  return !!m && m.ids.length > 0 && m.index < m.ids.length;
}

/** The saved, unfinished marathon for one pool (all questions or a topic). */
export function marathonFor(
  marathons: Record<string, MarathonState>,
  track: TrackId,
  state: StateCode,
  topic?: TopicId,
): MarathonState | null {
  const m = marathons[marathonKey(track, state, topic)];
  return isUnfinished(m) ? m : null;
}

/** Most recently started unfinished marathon for this learner's track + state. */
export function latestMarathon(
  marathons: Record<string, MarathonState>,
  track: TrackId,
  state: StateCode,
  validTopics: ReadonlySet<TopicId>,
): ActiveMarathon | null {
  const prefix = `${track}:${state}:`;
  let best: ActiveMarathon | null = null;
  for (const [key, m] of Object.entries(marathons)) {
    if (!key.startsWith(prefix) || !isUnfinished(m)) {
      continue;
    }
    const suffix = key.slice(prefix.length);
    let topic: TopicId | undefined;
    if (suffix !== 'all') {
      if (!validTopics.has(suffix as TopicId)) {
        continue;
      }
      topic = suffix as TopicId;
    }
    if (!best || m.startedAt > best.state.startedAt) {
      best = {key, topic, state: m};
    }
  }
  return best;
}

/** "12 of 40 correct" style accuracy summary for one question. */
export function questionAccuracy(s: QStat | undefined): string {
  if (!s || s.a === 0) {
    return 'Not answered yet';
  }
  return `${s.c} of ${s.a} correct`;
}
