import type {Bank} from '../data/bank';
import type {StateFact, StateCode, TrackId} from '../data/types';
import {defineStrings, tr} from '../i18n';
import type {ExamRecord} from '../store/progress';
import type {Readiness} from './readiness';
import {isMistake, QStat} from './srs';

export interface ChecklistItem {
  id: string;
  label: string;
  /** Short progress text, e.g. "312 / 849". */
  progress: string;
  /** 0–1 toward the goal. */
  ratio: number;
  done: boolean;
}

export interface ChecklistInput {
  bank: Bank;
  stats: Record<string, QStat>;
  exams: ExamRecord[];
  readiness: Readiness;
  facts: StateFact[];
  /** Flashcard levels keyed "fact:<STATE>:<key>". */
  levels: Record<string, number>;
  track: TrackId;
  state: StateCode;
}

const STR = defineStrings(
  {
    coverage: 'Practice at least 80% of your questions',
    chance: 'Reach an 85% estimated pass chance',
    exams: 'Pass 3 exam simulations in a row',
    mistakes: 'Fix your mistakes (5 or fewer left)',
    mistakesLeft: (n: number) => `${n} left`,
    facts: 'Know your state’s numbers (flashcards)',
    signs: 'Get 90% of road-sign questions right',
  },
  {
    coverage: 'Practica al menos el 80% de tus preguntas',
    chance: 'Alcanza un 85% de probabilidad estimada de aprobar',
    exams: 'Aprueba 3 simulaciones de examen seguidas',
    mistakes: 'Corrige tus errores (que queden 5 o menos)',
    mistakesLeft: (n: number) => (n === 1 ? 'queda 1' : `quedan ${n}`),
    facts: 'Conoce los números de tu estado (tarjetas de estudio)',
    signs: 'Acierta el 90% de las preguntas de señales',
  },
);

const clamp = (v: number) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));

/**
 * "Ready for your test?" — concrete, checkable goals that together predict a
 * first-try pass: broad practice, a high estimated pass chance, consecutive
 * passed simulations, few open mistakes, and the state's numbers + signs known.
 */
export function testReadyChecklist(input: ChecklistInput): ChecklistItem[] {
  const {bank, stats, exams, readiness, facts, levels, track, state} = input;
  const t = tr(STR);
  const items: ChecklistItem[] = [];

  const total = bank.questions.length;
  const seen = readiness.seen;
  items.push({
    id: 'coverage',
    label: t.coverage,
    progress: `${seen} / ${total}`,
    ratio: clamp(total ? seen / (total * 0.8) : 0),
    done: total > 0 && seen >= total * 0.8,
  });

  const pct = Math.round(readiness.passProbability * 100);
  items.push({
    id: 'chance',
    label: t.chance,
    progress: `${pct}%`,
    ratio: clamp(readiness.passProbability / 0.85),
    done: readiness.passProbability >= 0.85,
  });

  const mine = exams.filter(e => e.track === track && e.state === state);
  let streak = 0;
  for (const e of mine) {
    if (!e.passed) {
      break;
    }
    streak++;
  }
  items.push({
    id: 'exams',
    label: t.exams,
    progress: `${Math.min(streak, 3)} / 3`,
    ratio: clamp(streak / 3),
    done: streak >= 3,
  });

  let mistakes = 0;
  for (const q of bank.questions) {
    if (isMistake(stats[q.id])) {
      mistakes++;
    }
  }
  items.push({
    id: 'mistakes',
    label: t.mistakes,
    progress: t.mistakesLeft(mistakes),
    ratio: seen === 0 ? 0 : clamp(1 - Math.max(0, mistakes - 5) / Math.max(10, seen * 0.2)),
    done: seen > 0 && mistakes <= 5,
  });

  if (facts.length && track !== 'cdl') {
    const known = facts.filter(f => (levels[`fact:${state}:${f.key}`] ?? 0) >= 2).length;
    items.push({
      id: 'facts',
      label: t.facts,
      progress: `${known} / ${facts.length}`,
      ratio: clamp(known / (facts.length * 0.8)),
      done: known >= facts.length * 0.8,
    });
  }

  if (bank.signQuestions.length) {
    const right = bank.signQuestions.filter(q => (stats[q.id]?.s ?? 0) > 0).length;
    const need = Math.ceil(bank.signQuestions.length * 0.9);
    items.push({
      id: 'signs',
      label: t.signs,
      progress: `${right} / ${bank.signQuestions.length}`,
      ratio: clamp(right / need),
      done: right >= need,
    });
  }
  return items;
}
