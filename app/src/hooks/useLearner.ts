import {useEffect, useMemo, useState} from 'react';
import {Bank, getBank} from '../data/bank';
import {getExamConfigs} from '../data/exams';
import {getStateInfo} from '../data/states';
import {getTrack, TrackMeta} from '../data/tracks';
import type {ExamConfig, StateCode, StateInfo, TrackId} from '../data/types';
import {computeReadiness, Readiness} from '../engine/readiness';
import {useProgress} from '../store/progress';
import {useSettings} from '../store/settings';

export interface Learner {
  state: StateCode;
  track: TrackId;
  trackMeta: TrackMeta;
  stateInfo: StateInfo;
  bank: Bank;
  exams: ExamConfig[];
  /** The main exam (car/motorcycle) or CDL general knowledge. */
  exam: ExamConfig;
}

/** Current learner context: selected state + track and the derived question bank. */
export function useLearner(): Learner {
  const state = useSettings(s => s.state) ?? 'CA';
  const track = useSettings(s => s.track);
  return useMemo(() => {
    const exams = getExamConfigs(track, state);
    return {
      state,
      track,
      trackMeta: getTrack(track),
      stateInfo: getStateInfo(state),
      bank: getBank(track, state),
      exams,
      exam: exams[0],
    };
  }, [state, track]);
}

/** Pass-probability model for an exam (defaults to the learner's main exam). */
export function useReadiness(exam?: ExamConfig): Readiness {
  const learner = useLearner();
  const stats = useProgress(s => s.stats);
  const target = exam ?? learner.exam;
  return useMemo(() => computeReadiness(learner.bank, stats, target), [learner.bank, stats, target]);
}

/** True once both persisted stores have loaded from disk. */
export function useHydrated(): boolean {
  const [ready, setReady] = useState(
    () => useSettings.persist.hasHydrated() && useProgress.persist.hasHydrated(),
  );
  useEffect(() => {
    const check = () => setReady(useSettings.persist.hasHydrated() && useProgress.persist.hasHydrated());
    const unsubs = [useSettings.persist.onFinishHydration(check), useProgress.persist.onFinishHydration(check)];
    check();
    return () => unsubs.forEach(u => u());
  }, []);
  return ready;
}
