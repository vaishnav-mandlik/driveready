import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {StateCode, TopicId, TrackId} from '../data/types';
import {dayKey} from '../engine/dates';
import {applyAnswer, isMistake, QStat} from '../engine/srs';
import {persistStorage} from './storage';

/** Activity for one local calendar day. */
export interface DayStat {
  /** questions answered */
  q: number;
  /** correct answers */
  c: number;
  /** seconds studied */
  sec: number;
  /** exam simulations finished */
  x: number;
}

export interface ExamRecord {
  id: string;
  track: TrackId;
  state: StateCode;
  examId: string;
  title: string;
  at: number;
  total: number;
  /** Questions actually answered (realistic mode may stop early). */
  answered: number;
  correct: number;
  passingScore: number;
  passed: boolean;
  durationSec: number;
  endedEarly: boolean;
  timedOut: boolean;
  /** topic -> [correct, asked] */
  byTopic: Partial<Record<TopicId, [number, number]>>;
  wrongIds: string[];
}

export interface MarathonState {
  ids: string[];
  index: number;
  correct: number;
  wrong: number;
  startedAt: number;
}

export interface ProgressState {
  stats: Record<string, QStat>;
  bookmarks: Record<string, number>;
  exams: ExamRecord[];
  days: Record<string, DayStat>;
  achievements: Record<string, number>;
  marathons: Record<string, MarathonState>;
  /** Flashcard confidence per sign code: 0 = learning, 1 = almost, 2 = known. */
  signLevels: Record<string, number>;
  lessonsRead: Record<string, number>;
  /** How many questions have moved out of "Mistakes" by being answered right twice in a row. */
  clearedMistakes: number;
  totalAnswered: number;
  totalCorrect: number;
  marathonsFinished: number;
  /** Personal bests, e.g. "survival:car:CA" -> 42 correct. */
  bests: Record<string, number>;

  recordAnswer: (questionId: string, correct: boolean, now?: number) => void;
  recordExam: (record: ExamRecord) => void;
  addStudyTime: (seconds: number, now?: number) => void;
  toggleBookmark: (questionId: string) => void;
  setMarathon: (key: string, value: MarathonState | null) => void;
  finishMarathon: (key: string) => void;
  setSignLevel: (code: string, level: number) => void;
  markLessonRead: (lessonId: string) => void;
  unlockAchievements: (ids: string[], now?: number) => void;
  /** Stores value if it beats the previous best; returns true when it is a new record. */
  recordBest: (key: string, value: number) => boolean;
  resetProgress: () => void;
}

const empty = {
  stats: {} as Record<string, QStat>,
  bookmarks: {} as Record<string, number>,
  exams: [] as ExamRecord[],
  days: {} as Record<string, DayStat>,
  achievements: {} as Record<string, number>,
  marathons: {} as Record<string, MarathonState>,
  signLevels: {} as Record<string, number>,
  lessonsRead: {} as Record<string, number>,
  clearedMistakes: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  marathonsFinished: 0,
  bests: {} as Record<string, number>,
};

const MAX_EXAMS = 200;

function bumpDay(days: Record<string, DayStat>, key: string, patch: Partial<DayStat>): Record<string, DayStat> {
  const d = days[key] ?? {q: 0, c: 0, sec: 0, x: 0};
  return {
    ...days,
    [key]: {
      q: d.q + (patch.q ?? 0),
      c: d.c + (patch.c ?? 0),
      sec: d.sec + (patch.sec ?? 0),
      x: d.x + (patch.x ?? 0),
    },
  };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...empty,

      recordAnswer: (questionId, correct, now = Date.now()) =>
        set(s => {
          const prev = s.stats[questionId];
          const next = applyAnswer(prev, correct, now);
          const cleared = isMistake(prev) && !isMistake(next) ? 1 : 0;
          return {
            stats: {...s.stats, [questionId]: next},
            days: bumpDay(s.days, dayKey(now), {q: 1, c: correct ? 1 : 0}),
            totalAnswered: s.totalAnswered + 1,
            totalCorrect: s.totalCorrect + (correct ? 1 : 0),
            clearedMistakes: s.clearedMistakes + cleared,
          };
        }),

      recordExam: record =>
        set(s => ({
          exams: [record, ...s.exams].slice(0, MAX_EXAMS),
          days: bumpDay(s.days, dayKey(record.at), {x: 1}),
        })),

      addStudyTime: (seconds, now = Date.now()) =>
        set(s => ({days: bumpDay(s.days, dayKey(now), {sec: Math.max(0, Math.round(seconds))})})),

      toggleBookmark: questionId =>
        set(s => {
          const bookmarks = {...s.bookmarks};
          if (bookmarks[questionId]) {
            delete bookmarks[questionId];
          } else {
            bookmarks[questionId] = Date.now();
          }
          return {bookmarks};
        }),

      setMarathon: (key, value) =>
        set(s => {
          const marathons = {...s.marathons};
          if (value) {
            marathons[key] = value;
          } else {
            delete marathons[key];
          }
          return {marathons};
        }),

      finishMarathon: key =>
        set(s => {
          const marathons = {...s.marathons};
          delete marathons[key];
          return {marathons, marathonsFinished: s.marathonsFinished + 1};
        }),

      setSignLevel: (code, level) => set(s => ({signLevels: {...s.signLevels, [code]: level}})),

      markLessonRead: lessonId =>
        set(s => (s.lessonsRead[lessonId] ? s : {lessonsRead: {...s.lessonsRead, [lessonId]: Date.now()}})),

      unlockAchievements: (ids, now = Date.now()) =>
        set(s => {
          const fresh = ids.filter(id => !s.achievements[id]);
          if (!fresh.length) {
            return s;
          }
          const achievements = {...s.achievements};
          for (const id of fresh) {
            achievements[id] = now;
          }
          return {achievements};
        }),

      recordBest: (key, value) => {
        const prev = get().bests[key] ?? 0;
        if (value <= prev) {
          return false;
        }
        set(s => ({bests: {...s.bests, [key]: value}}));
        return true;
      },

      resetProgress: () => set({...empty}),
    }),
    {
      name: 'progress.v1',
      storage: persistStorage,
      version: 1,
      partialize: s => ({
        stats: s.stats,
        bookmarks: s.bookmarks,
        exams: s.exams,
        days: s.days,
        achievements: s.achievements,
        marathons: s.marathons,
        signLevels: s.signLevels,
        lessonsRead: s.lessonsRead,
        clearedMistakes: s.clearedMistakes,
        totalAnswered: s.totalAnswered,
        totalCorrect: s.totalCorrect,
        marathonsFinished: s.marathonsFinished,
        bests: s.bests,
      }),
    },
  ),
);

export const getProgress = () => useProgress.getState();
