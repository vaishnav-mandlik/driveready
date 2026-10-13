import {useEffect, useMemo, useState} from 'react';
import {AppState} from 'react-native';
import {useLearner} from '../../../hooks/useLearner';
import type {TopicId} from '../../../data/types';
import {dayKey} from '../../../engine/dates';
import {useProgress} from '../../../store/progress';
import {useSessions} from '../../../store/session';
import {answeredAllToday, dailyChallengeIds, modeCounts, ModeCounts, topicProgressMap, TopicProgress} from './practiceData';

/** Anything with React Navigation's `addListener('focus', ...)` (screen navigation props). */
export interface FocusSource {
  addListener: (event: 'focus', callback: () => void) => () => void;
}

/**
 * A timestamp that refreshes whenever the screen regains focus or the app
 * returns to the foreground, so day-based data (today's goal, due reviews,
 * the question of the day) rolls over without recomputing on every render.
 */
export function useNow(navigation?: FocusSource): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const unsubscribe = navigation?.addListener('focus', refresh);
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') {
        refresh();
      }
    });
    return () => {
      unsubscribe?.();
      sub.remove();
    };
  }, [navigation]);
  return now;
}

/** Memoized pool sizes for every practice mode (optionally within one topic). */
export function useModeCounts(now: number, topic?: TopicId): ModeCounts {
  const {bank} = useLearner();
  const stats = useProgress(s => s.stats);
  const bookmarks = useProgress(s => s.bookmarks);
  return useMemo(() => modeCounts(bank, stats, bookmarks, now, topic), [bank, stats, bookmarks, now, topic]);
}

/** Memoized per-topic progress for the learner's bank. */
export function useTopicProgress(now: number): Map<TopicId, TopicProgress> {
  const {bank} = useLearner();
  const stats = useProgress(s => s.stats);
  return useMemo(() => topicProgressMap(bank, stats, now), [bank, stats, now]);
}

/** Personal best for survival / speed round (0 if none yet). */
export function usePersonalBest(mode: 'survival' | 'speed'): number {
  const {track, state} = useLearner();
  return useProgress(s => s.bests[`${mode}:${track}:${state}`] ?? 0);
}

/**
 * Whether today's Daily Challenge is complete: a finished daily session from
 * today is still in memory, or every one of today's questions was answered today.
 */
export function useDailyChallengeDone(now: number): boolean {
  const {bank, track, state} = useLearner();
  const stats = useProgress(s => s.stats);
  const sessions = useSessions(s => s.sessions);
  const today = dayKey(now);
  // `today` (not `now`) keys the pick so it is computed once per day.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ids = useMemo(() => dailyChallengeIds(bank, now), [bank, today]);
  return useMemo(() => {
    const finishedToday = Object.values(sessions).some(
      s =>
        s.spec.mode === 'daily' &&
        s.track === track &&
        s.state === state &&
        s.finishedAt !== null &&
        !s.endedEarly &&
        dayKey(s.finishedAt) === today,
    );
    return finishedToday || answeredAllToday(ids, stats, now);
  }, [sessions, track, state, today, ids, stats, now]);
}
