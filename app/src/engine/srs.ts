import {DAY} from './dates';

/**
 * Per-question learning record (kept terse: thousands are persisted).
 * a = attempts, c = correct, s = current streak of consecutive correct
 * answers, w = total wrong, b = Leitner box (0–6), d = next due time (ms),
 * t = last answered time (ms).
 */
export interface QStat {
  a: number;
  c: number;
  s: number;
  w: number;
  b: number;
  d: number;
  t: number;
}

/** Review intervals per Leitner box. Box 0 = never answered correctly. */
const INTERVALS = [0, 10 * 60 * 1000, 1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];
export const MAX_BOX = INTERVALS.length - 1;

/** Consecutive correct answers needed to clear a question from "Mistakes". */
export const CLEAR_STREAK = 2;

export function applyAnswer(prev: QStat | undefined, correct: boolean, now: number): QStat {
  const p = prev ?? {a: 0, c: 0, s: 0, w: 0, b: 0, d: 0, t: 0};
  const b = correct ? Math.min(MAX_BOX, p.b + 1) : p.b > 0 ? 1 : 0;
  return {
    a: p.a + 1,
    c: p.c + (correct ? 1 : 0),
    s: correct ? p.s + 1 : 0,
    w: p.w + (correct ? 0 : 1),
    b,
    d: now + (correct ? INTERVALS[b] : INTERVALS[1]),
    t: now,
  };
}

/** Got it wrong at some point and hasn't yet answered it right twice in a row. */
export function isMistake(s: QStat | undefined): boolean {
  return !!s && s.w > 0 && s.s < CLEAR_STREAK;
}

export function isDue(s: QStat | undefined, now: number): boolean {
  return !!s && s.a > 0 && s.d <= now;
}

/** Mastered = answered correctly on three spaced occasions in a row. */
export function isMastered(s: QStat | undefined): boolean {
  return !!s && s.b >= 3 && s.s >= 2;
}

/**
 * Estimated probability the learner answers this question correctly now.
 * Blends the latest outcome with the smoothed historical accuracy and the
 * Leitner box (which rewards spaced repetition over cramming).
 */
export function knowledge(s: QStat | undefined, unseenPrior: number): number {
  if (!s || s.a === 0) {
    return unseenPrior;
  }
  // Historical accuracy, smoothed toward a 60% prior worth two answers.
  const base = (s.c + 1.2) / (s.a + 2);
  // Each consecutive correct answer closes part of the remaining gap;
  // a wrong latest answer is a strong signal the rule isn't learned yet.
  const k = s.s > 0 ? base + (1 - base) * (1 - 0.5 ** s.s) * 0.85 : base * 0.85;
  return Math.min(0.99, Math.max(0.05, k));
}
