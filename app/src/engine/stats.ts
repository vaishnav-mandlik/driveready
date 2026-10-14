import type {DayStat, ExamRecord} from '../store/progress';
import {defineStrings, tr} from '../i18n';
import {currentStreak, dayKey, lastNDays, longestStreak} from './dates';

export interface Totals {
  answered: number;
  correct: number;
  accuracy: number | null;
  studySeconds: number;
  examsTaken: number;
  examsPassed: number;
  bestExamPercent: number | null;
  streak: number;
  longestStreak: number;
  todayAnswered: number;
}

export function activeDayMap(days: Record<string, DayStat>): Record<string, true> {
  const out: Record<string, true> = {};
  for (const [k, d] of Object.entries(days)) {
    if (d.q > 0 || d.x > 0) {
      out[k] = true;
    }
  }
  return out;
}

export function computeTotals(
  days: Record<string, DayStat>,
  exams: ExamRecord[],
  totalAnswered: number,
  totalCorrect: number,
  now: number = Date.now(),
): Totals {
  let studySeconds = 0;
  for (const d of Object.values(days)) {
    studySeconds += d.sec;
  }
  const active = activeDayMap(days);
  const best = exams.reduce<number | null>((b, e) => {
    const pct = e.total ? Math.round((e.correct / e.total) * 100) : 0;
    return b === null || pct > b ? pct : b;
  }, null);
  return {
    answered: totalAnswered,
    correct: totalCorrect,
    accuracy: totalAnswered ? totalCorrect / totalAnswered : null,
    studySeconds,
    examsTaken: exams.length,
    examsPassed: exams.filter(e => e.passed).length,
    bestExamPercent: best,
    streak: currentStreak(active, now),
    longestStreak: longestStreak(active),
    todayAnswered: days[dayKey(now)]?.q ?? 0,
  };
}

export interface DayPoint {
  key: string;
  /** Short weekday label, e.g. "Mo". */
  label: string;
  answered: number;
  correct: number;
  seconds: number;
}

const WEEKDAYS = defineStrings(
  {days: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']},
  {days: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']},
);

export function activitySeries(days: Record<string, DayStat>, n = 14, now: number = Date.now()): DayPoint[] {
  const weekdays = tr(WEEKDAYS).days;
  return lastNDays(n, now).map(key => {
    const d = days[key];
    const [y, m, dd] = key.split('-').map(Number);
    return {
      key,
      label: weekdays[new Date(y, m - 1, dd).getDay()],
      answered: d?.q ?? 0,
      correct: d?.c ?? 0,
      seconds: d?.sec ?? 0,
    };
  });
}
