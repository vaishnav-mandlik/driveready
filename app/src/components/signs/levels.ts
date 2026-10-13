import type {SignInfo} from '../../data/types';
import {useProgress} from '../../store/progress';
import type {Tone} from '../Bits';

/** Flashcard confidence stored in `progress.signLevels`: 0 learning, 1 almost, 2 known. */
export type SignLevel = 0 | 1 | 2;

export const LEVEL_LEARNING: SignLevel = 0;
export const LEVEL_ALMOST: SignLevel = 1;
export const LEVEL_KNOWN: SignLevel = 2;

export const LEVEL_META: Record<SignLevel, {label: string; short: string; tone: Tone}> = {
  0: {label: 'Still learning', short: 'Learning', tone: 'warning'},
  1: {label: 'Almost known', short: 'Almost', tone: 'primary'},
  2: {label: 'Known', short: 'Known', tone: 'success'},
};

/** Level for a sign, or undefined when it was never studied. Tolerates bad persisted values. */
export function readLevel(levels: Record<string, number>, code: string): SignLevel | undefined {
  const v = levels[code];
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    return undefined;
  }
  return v >= 2 ? 2 : v >= 1 ? 1 : 0;
}

/**
 * "Got it": a sign you were still learning moves to "almost" first, and needs
 * one more correct recall to count as known (like clearing a mistake by
 * answering it right twice). New or almost-known signs become known.
 */
export function levelAfterGotIt(prev: SignLevel | undefined): SignLevel {
  return prev === LEVEL_LEARNING ? LEVEL_ALMOST : LEVEL_KNOWN;
}

/** Seen but not yet known — what the "Learning only" flashcard filter keeps. */
export function isLearning(level: SignLevel | undefined): boolean {
  return level === LEVEL_LEARNING || level === LEVEL_ALMOST;
}

export interface Mastery {
  total: number;
  known: number;
  almost: number;
  learning: number;
  unseen: number;
}

export function masteryOf(signs: SignInfo[], levels: Record<string, number>): Mastery {
  const m: Mastery = {total: signs.length, known: 0, almost: 0, learning: 0, unseen: 0};
  for (const s of signs) {
    const l = readLevel(levels, s.code);
    if (l === undefined) {
      m.unseen++;
    } else if (l === LEVEL_KNOWN) {
      m.known++;
    } else if (l === LEVEL_ALMOST) {
      m.almost++;
    } else {
      m.learning++;
    }
  }
  return m;
}

/** True when any sign has a level (used to decide whether to show the legend). */
export function hasAnyLevel(levels: Record<string, number>): boolean {
  for (const k in levels) {
    if (Object.prototype.hasOwnProperty.call(levels, k)) {
      return true;
    }
  }
  return false;
}

/** Restores a sign's level (undo). `undefined` removes it, so the sign counts as new again. */
export function restoreSignLevel(code: string, level: SignLevel | undefined) {
  if (level !== undefined) {
    useProgress.getState().setSignLevel(code, level);
    return;
  }
  useProgress.setState(s => {
    if (!(code in s.signLevels)) {
      return s;
    }
    const signLevels = {...s.signLevels};
    delete signLevels[code];
    return {signLevels};
  });
}
