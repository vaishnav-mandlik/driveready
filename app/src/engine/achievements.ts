import type {IconName} from '../components/Icon';
import type {Bank} from '../data/bank';
import type {DayStat, ExamRecord} from '../store/progress';
import {currentStreak, dayKey} from './dates';
import type {QStat} from './srs';

export interface AchievementContext {
  stats: Record<string, QStat>;
  exams: ExamRecord[];
  days: Record<string, DayStat>;
  signLevels: Record<string, number>;
  lessonsRead: Record<string, number>;
  clearedMistakes: number;
  totalAnswered: number;
  marathonsFinished: number;
  dailyGoal: number;
  bank: Bank;
  passProbability: number;
  now: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  tier: 'bronze' | 'silver' | 'gold';
  check: (c: AchievementContext) => boolean;
  /** Optional progress toward the goal, 0–1, for the achievements screen. */
  progress?: (c: AchievementContext) => number;
}

const ratio = (v: number, goal: number) => Math.min(1, v / goal);
const activeDays = (c: AchievementContext) =>
  Object.fromEntries(Object.entries(c.days).filter(([, d]) => d.q > 0 || d.x > 0));
const hour = (t: number) => new Date(t).getHours();

export const ACHIEVEMENTS: AchievementDef[] = [
  {id: 'first-answer', title: 'First Step', description: 'Answer your first question.', icon: 'footprints', tier: 'bronze', check: c => c.totalAnswered >= 1},
  {id: 'answers-100', title: 'Century', description: 'Answer 100 questions.', icon: 'target', tier: 'bronze', check: c => c.totalAnswered >= 100, progress: c => ratio(c.totalAnswered, 100)},
  {id: 'answers-500', title: 'Road Scholar', description: 'Answer 500 questions.', icon: 'graduation', tier: 'silver', check: c => c.totalAnswered >= 500, progress: c => ratio(c.totalAnswered, 500)},
  {id: 'answers-1000', title: 'Thousand Miles', description: 'Answer 1,000 questions.', icon: 'milestone', tier: 'gold', check: c => c.totalAnswered >= 1000, progress: c => ratio(c.totalAnswered, 1000)},
  {id: 'first-exam', title: 'Test Drive', description: 'Finish an exam simulation.', icon: 'clipboard-check', tier: 'bronze', check: c => c.exams.length >= 1},
  {id: 'first-pass', title: 'Passed!', description: 'Pass an exam simulation.', icon: 'badge-check', tier: 'silver', check: c => c.exams.some(e => e.passed)},
  {id: 'perfect-exam', title: 'Flawless', description: 'Score 100% on a full exam simulation.', icon: 'crown', tier: 'gold', check: c => c.exams.some(e => !e.endedEarly && e.total > 0 && e.correct === e.total)},
  {id: 'three-passes', title: 'Hat Trick', description: 'Pass 3 exam simulations in a row.', icon: 'trophy', tier: 'gold', check: c => c.exams.length >= 3 && c.exams.slice(0, 3).every(e => e.passed)},
  {id: 'streak-3', title: 'On a Roll', description: 'Study 3 days in a row.', icon: 'flame', tier: 'bronze', check: c => currentStreak(activeDays(c), c.now) >= 3, progress: c => ratio(currentStreak(activeDays(c), c.now), 3)},
  {id: 'streak-7', title: 'Week Warrior', description: 'Study 7 days in a row.', icon: 'flame', tier: 'silver', check: c => currentStreak(activeDays(c), c.now) >= 7, progress: c => ratio(currentStreak(activeDays(c), c.now), 7)},
  {id: 'streak-30', title: 'Unstoppable', description: 'Study 30 days in a row.', icon: 'flame', tier: 'gold', check: c => currentStreak(activeDays(c), c.now) >= 30, progress: c => ratio(currentStreak(activeDays(c), c.now), 30)},
  {id: 'daily-goal', title: 'Goal Getter', description: 'Hit your daily question goal.', icon: 'target', tier: 'bronze', check: c => (c.days[dayKey(c.now)]?.q ?? 0) >= c.dailyGoal, progress: c => ratio(c.days[dayKey(c.now)]?.q ?? 0, c.dailyGoal)},
  {id: 'mistakes-25', title: 'Mistake Crusher', description: 'Clear 25 questions from your mistakes by getting them right twice in a row.', icon: 'zap', tier: 'silver', check: c => c.clearedMistakes >= 25, progress: c => ratio(c.clearedMistakes, 25)},
  {id: 'marathon', title: 'Marathoner', description: 'Finish a marathon of every question.', icon: 'infinity', tier: 'gold', check: c => c.marathonsFinished >= 1},
  {
    id: 'sign-expert',
    title: 'Sign Expert',
    description: 'Answer 50 different road-sign questions correctly.',
    icon: 'signpost',
    tier: 'silver',
    check: c => signCorrect(c) >= Math.min(50, c.bank.signQuestions.length || 50),
    progress: c => ratio(signCorrect(c), Math.min(50, c.bank.signQuestions.length || 50)),
  },
  {id: 'lessons-5', title: 'Bookworm', description: 'Read 5 study lessons.', icon: 'book', tier: 'bronze', check: c => Object.keys(c.lessonsRead).length >= 5, progress: c => ratio(Object.keys(c.lessonsRead).length, 5)},
  {id: 'night-owl', title: 'Night Owl', description: 'Study after 10 PM.', icon: 'moon', tier: 'bronze', check: c => hour(c.now) >= 22},
  {id: 'early-bird', title: 'Early Bird', description: 'Study before 7 AM.', icon: 'sunrise', tier: 'bronze', check: c => hour(c.now) < 7 && hour(c.now) >= 4},
  {id: 'ready', title: 'Test Ready', description: 'Reach a 90% estimated pass chance.', icon: 'sparkles', tier: 'gold', check: c => c.passProbability >= 0.9, progress: c => ratio(c.passProbability, 0.9)},
];

function signCorrect(c: AchievementContext): number {
  let n = 0;
  for (const q of c.bank.signQuestions) {
    if ((c.stats[q.id]?.c ?? 0) > 0) {
      n++;
    }
  }
  return n;
}

/** Ids of achievements whose condition is met but are not yet unlocked. */
export function newlyEarned(c: AchievementContext, unlocked: Record<string, number>): AchievementDef[] {
  return ACHIEVEMENTS.filter(a => !unlocked[a.id] && a.check(c));
}

export function getAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}
