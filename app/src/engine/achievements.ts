import type {IconName} from '../components/Icon';
import type {Bank} from '../data/bank';
import {currentLang, defineStrings, tr} from '../i18n';
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

/** Spanish title/description per achievement id (English lives in ACHIEVEMENTS). */
const ACHIEVEMENT_ES: Record<string, {title: string; description: string}> = {
  'first-answer': {title: 'Primer paso', description: 'Responde tu primera pregunta.'},
  'answers-100': {title: 'Centenario', description: 'Responde 100 preguntas.'},
  'answers-500': {title: 'Experto del camino', description: 'Responde 500 preguntas.'},
  'answers-1000': {title: 'Mil millas', description: 'Responde 1,000 preguntas.'},
  'first-exam': {title: 'Primera vuelta', description: 'Termina una simulación de examen.'},
  'first-pass': {title: '¡Aprobado!', description: 'Aprueba una simulación de examen.'},
  'perfect-exam': {title: 'Impecable', description: 'Saca 100 % en una simulación de examen completa.'},
  'three-passes': {title: 'Triplete', description: 'Aprueba 3 simulaciones de examen seguidas.'},
  'streak-3': {title: 'En racha', description: 'Estudia 3 días seguidos.'},
  'streak-7': {title: 'Guerrero semanal', description: 'Estudia 7 días seguidos.'},
  'streak-30': {title: 'Imparable', description: 'Estudia 30 días seguidos.'},
  'daily-goal': {title: 'Meta cumplida', description: 'Alcanza tu meta diaria de preguntas.'},
  'mistakes-25': {title: 'Cazaerrores', description: 'Elimina 25 preguntas de tus errores respondiéndolas bien dos veces seguidas.'},
  marathon: {title: 'Maratonista', description: 'Termina un maratón con todas las preguntas.'},
  'sign-expert': {title: 'Experto en señales', description: 'Responde bien 50 preguntas distintas de señales de tránsito.'},
  'lessons-5': {title: 'Ratón de biblioteca', description: 'Lee 5 lecciones de estudio.'},
  'night-owl': {title: 'Noctámbulo', description: 'Estudia después de las 10 p.m.'},
  'early-bird': {title: 'Madrugador', description: 'Estudia antes de las 7 a.m.'},
  ready: {title: 'Listo para el examen', description: 'Alcanza una probabilidad estimada de aprobar del 90 %.'},
};

/** An achievement with its title/description in the current language. */
function localize(a: AchievementDef): AchievementDef {
  if (currentLang() === 'en') {
    return a;
  }
  const t = ACHIEVEMENT_ES[a.id];
  return t ? {...a, ...t} : a;
}

/** All achievements, in order, with text in the current language. */
export function achievements(): AchievementDef[] {
  return currentLang() === 'en' ? ACHIEVEMENTS : ACHIEVEMENTS.map(localize);
}

const TIER_TEXT = defineStrings<Record<AchievementDef['tier'], string>>(
  {bronze: 'bronze', silver: 'silver', gold: 'gold'},
  {bronze: 'bronce', silver: 'plata', gold: 'oro'},
);

/** Tier name in the current language (lowercase, e.g. "bronze" / "bronce"). */
export function tierLabel(tier: AchievementDef['tier']): string {
  return tr(TIER_TEXT)[tier];
}

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
  return ACHIEVEMENTS.filter(a => !unlocked[a.id] && a.check(c)).map(localize);
}

export function getAchievement(id: string): AchievementDef | undefined {
  const a = ACHIEVEMENTS.find(x => x.id === id);
  return a ? localize(a) : undefined;
}
