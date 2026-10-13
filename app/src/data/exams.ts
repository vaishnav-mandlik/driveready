import {getStateInfo} from './states';
import {getTrack} from './tracks';
import type {CdlTopicId, ExamConfig, StateCode, TrackId} from './types';

/**
 * Federal standard (49 CFR 383.135) requires 80% to pass each CDL knowledge
 * test; the question counts below are the common AAMVA-model formats used by
 * most states. A state's own CDL general-knowledge format overrides them.
 */
const CDL_DEFAULTS: Record<CdlTopicId, number> = {
  'cdl-general': 50,
  'cdl-air-brakes': 25,
  'cdl-combination': 20,
  'cdl-hazmat': 30,
  'cdl-tanker': 20,
  'cdl-doubles-triples': 20,
  'cdl-passenger': 20,
  'cdl-school-bus': 20,
};

const pct = (n: number, p: number) => Math.ceil((n * p) / 100);

export function getExamConfigs(track: TrackId, state: StateCode): ExamConfig[] {
  const info = getStateInfo(state);
  if (track === 'car') {
    const e = info.exam;
    return [
      {
        id: `car-${state}`,
        track,
        title: `${info.name} Knowledge Test`,
        questions: e.questions,
        passingScore: e.passingScore,
        timeLimitMinutes: e.timeLimitMinutes,
        notes: e.notes,
        sourceUrl: e.sourceUrl,
      },
    ];
  }
  if (track === 'motorcycle') {
    const m = info.motorcycleExam;
    const questions = m?.questions ?? 25;
    const passingScore = m?.passingScore ?? pct(questions, m?.passingPercent ?? 80);
    return [
      {
        id: `motorcycle-${state}`,
        track,
        title: `${info.name} Motorcycle Test`,
        questions,
        passingScore,
        timeLimitMinutes: m?.timeLimitMinutes ?? null,
        notes:
          m?.notes ??
          'Typical motorcycle knowledge test format. Check your state agency for the exact number of questions.',
        sourceUrl: m?.sourceUrl,
      },
    ];
  }
  const cdl = info.cdlExam;
  return getTrack('cdl').topics.map(t => {
    const id = t.id as CdlTopicId;
    const isGeneral = id === 'cdl-general';
    const questions = isGeneral && cdl?.questions ? cdl.questions : CDL_DEFAULTS[id];
    return {
      id: `cdl-${id}-${state}`,
      track,
      topic: id,
      title: `CDL ${t.title}`,
      questions,
      passingScore: pct(questions, 80),
      timeLimitMinutes: null,
      notes:
        isGeneral && cdl?.notes
          ? cdl.notes
          : 'Federal rules require a score of at least 80% on every CDL knowledge test.',
      sourceUrl: isGeneral ? cdl?.sourceUrl : undefined,
    };
  });
}

export function getExamConfig(track: TrackId, state: StateCode, examId?: string): ExamConfig {
  const all = getExamConfigs(track, state);
  return all.find(e => e.id === examId) ?? all[0];
}
