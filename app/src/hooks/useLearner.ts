import {useEffect, useMemo, useState} from 'react';
import {Bank, getBank} from '../data/bank';
import {getExamConfigs} from '../data/exams';
import {getStateInfo} from '../data/states';
import {getTrack, TrackMeta} from '../data/tracks';
import type {ExamConfig, StateCode, StateInfo, TrackId} from '../data/types';
import {computeReadiness, Readiness} from '../engine/readiness';
import {useProgress} from '../store/progress';
import {useSettings} from '../store/settings';
import {hydrationFailed, onHydrationFailure} from '../store/storage';

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
  // Track titles, topics and the question bank are localized: rebuild when the language changes.
  const language = useSettings(s => s.language);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, track, language]);
}

/** Pass-probability model for an exam (defaults to the learner's main exam). */
export function useReadiness(exam?: ExamConfig): Readiness {
  const learner = useLearner();
  const stats = useProgress(s => s.stats);
  const target = exam ?? learner.exam;
  return useMemo(() => computeReadiness(learner.bank, stats, target), [learner.bank, stats, target]);
}

const loaded = () =>
  (useSettings.persist.hasHydrated() || hydrationFailed('settings.v1')) &&
  (useProgress.persist.hasHydrated() || hydrationFailed('progress.v1'));

/** True once both persisted stores have loaded from disk (or failed to, in which case defaults are used). */
export function useHydrated(): boolean {
  const [ready, setReady] = useState(loaded);
  useEffect(() => {
    const check = () => setReady(loaded());
    const unsubs = [useSettings.persist.onFinishHydration(check), useProgress.persist.onFinishHydration(check), onHydrationFailure(check)];
    check();
    return () => unsubs.forEach(u => u());
  }, []);
  return ready;
}
