import {getBank} from '../data/bank';
import {getExamConfig} from '../data/exams';
import type {Question} from '../data/types';
import {AchievementDef, newlyEarned} from '../engine/achievements';
import {randomSeed} from '../engine/random';
import {buildSession, QuizSession, QuizSpec, scoreSession, SessionResult} from '../engine/quiz';
import {computeReadiness} from '../engine/readiness';
import {getProgress} from './progress';
import {useSessions} from './session';
import {getSettings} from './settings';

/** Builds a new quiz session for the current learner (state + track from settings). */
export function startSession(spec: QuizSpec, now: number = Date.now()): QuizSession {
  const settings = getSettings();
  const progress = getProgress();
  const state = settings.state ?? 'CA';
  const bank = getBank(settings.track, state);
  const exam = spec.mode === 'exam' ? getExamConfig(settings.track, state, spec.examId) : undefined;
  const session = buildSession(spec, {
    bank,
    stats: progress.stats,
    bookmarks: progress.bookmarks,
    shuffleChoices: settings.shuffleChoices,
    examTimer: settings.examTimer,
    exam,
    marathon:
      spec.mode === 'marathon'
        ? progress.marathons[`${settings.track}:${state}:${spec.topic ?? 'all'}`]
        : undefined,
    now,
    seed: randomSeed(),
  });
  useSessions.getState().save(session);
  return session;
}

/**
 * Called once per answer in instant-feedback modes (practice, marathon,
 * mistakes...). `session` must already contain this answer. Exams record all
 * answers at the end instead.
 */
export function recordInstantAnswer(session: QuizSession, index: number, question: Question, choice: number) {
  const progress = getProgress();
  progress.recordAnswer(question.id, choice === question.answer);
  if (session.marathonKey && session.marathonBase) {
    const bank = getBank(session.track, session.state);
    let correct = 0;
    let wrong = 0;
    session.answers.forEach((a, i) => {
      if (a === null) {
        return;
      }
      if (a === bank.byId.get(session.questionIds[i])?.answer) {
        correct++;
      } else {
        wrong++;
      }
    });
    progress.setMarathon(session.marathonKey, {
      ids: session.questionIds,
      index: index + 1,
      correct: session.marathonBase.correct + correct,
      wrong: session.marathonBase.wrong + wrong,
      startedAt: session.marathonBase.startedAt,
    });
  }
}

export interface FinishOutcome {
  session: QuizSession;
  result: SessionResult;
  unlocked: AchievementDef[];
  /** Survival / speed round: true when this run set a new personal best. */
  newBest: boolean;
  /** Previous personal best for survival / speed round (0 if none). */
  previousBest: number;
}

export function bestKey(session: Pick<QuizSession, 'spec' | 'track' | 'state'>): string | null {
  const m = session.spec.mode;
  return m === 'survival' || m === 'speed' ? `${m}:${session.track}:${session.state}` : null;
}

/**
 * Ends a session: stamps it, records exam answers + history, study time,
 * marathon completion, and unlocks achievements. Returns what the Results
 * screen needs. Safe to call once per session.
 */
export function finishSession(
  session: QuizSession,
  opts: {endedEarly?: boolean; timedOut?: boolean} = {},
  now: number = Date.now(),
): FinishOutcome {
  const settings = getSettings();
  const bank = getBank(session.track, session.state);
  const finished: QuizSession = {
    ...session,
    finishedAt: session.finishedAt ?? now,
    endedEarly: opts.endedEarly ?? session.endedEarly,
    timedOut: opts.timedOut ?? session.timedOut,
  };
  const result = scoreSession(finished, bank, now);
  const progress = getProgress();

  if (finished.spec.mode === 'exam' && finished.exam) {
    finished.questionIds.forEach((id, i) => {
      const a = finished.answers[i];
      const q = bank.byId.get(id);
      if (a !== null && q) {
        progress.recordAnswer(id, a === q.answer, now);
      }
    });
    progress.recordExam({
      id: finished.id,
      track: finished.track,
      state: finished.state,
      examId: finished.exam.id,
      title: finished.title,
      at: now,
      total: result.total,
      answered: result.answered,
      correct: result.correct,
      passingScore: result.passingScore ?? 0,
      passed: !!result.passed,
      durationSec: result.durationSec,
      endedEarly: finished.endedEarly,
      timedOut: finished.timedOut,
      byTopic: result.byTopic,
      wrongIds: result.wrongIds,
    });
  }

  progress.addStudyTime(Math.min(result.durationSec, 60 * 90), now);

  if (finished.marathonKey) {
    const answeredAll = finished.answers.slice(finished.startIndex).every(a => a !== null);
    if (answeredAll) {
      getProgress().finishMarathon(finished.marathonKey);
    }
  }

  const key = bestKey(finished);
  const previousBest = key ? getProgress().bests[key] ?? 0 : 0;
  const newBest = key ? getProgress().recordBest(key, result.correct) : false;

  useSessions.getState().save(finished);
  const unlocked = checkAchievements(now);
  return {session: finished, result, unlocked, newBest, previousBest};
}

/** Evaluates and unlocks achievements for the current learner; returns the new ones. */
export function checkAchievements(now: number = Date.now()): AchievementDef[] {
  const settings = getSettings();
  if (!settings.state) {
    return [];
  }
  const p = getProgress();
  const bank = getBank(settings.track, settings.state);
  const exam = getExamConfig(settings.track, settings.state);
  const readiness = computeReadiness(bank, p.stats, exam);
  const earned = newlyEarned(
    {
      stats: p.stats,
      exams: p.exams,
      days: p.days,
      signLevels: p.signLevels,
      lessonsRead: p.lessonsRead,
      clearedMistakes: p.clearedMistakes,
      totalAnswered: p.totalAnswered,
      marathonsFinished: p.marathonsFinished,
      dailyGoal: settings.dailyGoal,
      bank,
      passProbability: readiness.passProbability,
      now,
    },
    p.achievements,
  );
  if (earned.length) {
    p.unlockAchievements(
      earned.map(a => a.id),
      now,
    );
  }
  return earned;
}
