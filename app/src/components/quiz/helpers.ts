/**
 * Pure helpers shared by the quiz screens and the QuestionCard family.
 * Nothing here touches React or the stores, so it is cheap to unit-test.
 */
import type {ChoiceState} from '../ChoiceButton';
import {getSign} from '../../data/signs';
import type {Question} from '../../data/types';
import {defineStrings, formatDate, tr} from '../../i18n';

export {SUPPORT_EMAIL} from '../../config';
import {SUPPORT_EMAIL} from '../../config';

const LETTERS = 'ABCDEFGH';

const STR = defineStrings(
  {
    option: (letter: string, text: string) => `Option ${letter}: ${text}.`,
    correctIs: (answer: string) => `The correct answer is ${answer}.`,
    reportSubject: (id: string) => `Question ${id}: problem report`,
    reportId: (id: string) => `Question ID: ${id}`,
    reportQuestion: (prompt: string) => `Question: ${prompt}`,
    reportAsk: 'What looks wrong? (answer, explanation, typo, outdated law...)',
    picture: (meaning: string) => `Picture: ${meaning}`,
    now: 'now',
    inMinutes: (n: number) => `in ${n} min`,
    inHours: (n: number) => `in ${n} hr`,
    tomorrow: 'tomorrow',
    inDays: (n: number) => `in ${n} days`,
    justNow: 'just now',
    minutesAgo: (n: number) => `${n} min ago`,
    hoursAgo: (n: number) => `${n} hr ago`,
    yesterday: 'yesterday',
    daysAgo: (n: number) => `${n} days ago`,
    shortDate: (month: number, day: number) => `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month]} ${day}`,
  },
  {
    option: (letter: string, text: string) => `Opción ${letter}: ${text}.`,
    correctIs: (answer: string) => `La respuesta correcta es ${answer}.`,
    reportSubject: (id: string) => `Pregunta ${id}: reporte de problema`,
    reportId: (id: string) => `ID de la pregunta: ${id}`,
    reportQuestion: (prompt: string) => `Pregunta: ${prompt}`,
    reportAsk: '¿Qué está mal? (respuesta, explicación, error tipográfico, ley desactualizada...)',
    picture: (meaning: string) => `Imagen: ${meaning}`,
    now: 'ahora',
    inMinutes: (n: number) => `en ${n} min`,
    inHours: (n: number) => `en ${n} h`,
    tomorrow: 'mañana',
    inDays: (n: number) => `en ${n} días`,
    justNow: 'hace un momento',
    minutesAgo: (n: number) => `hace ${n} min`,
    hoursAgo: (n: number) => `hace ${n} h`,
    yesterday: 'ayer',
    daysAgo: (n: number) => `hace ${n} días`,
    shortDate: (month: number, day: number) => `${day} ${['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'][month]}`,
  },
);

/** "A", "B", ... for a display position. */
export function letterAt(position: number): string {
  return LETTERS[position] ?? String(position + 1);
}

/** Choice display order; falls back to the authored order when none (or a stale one) is given. */
export function displayOrder(question: Question, order?: readonly number[] | null): number[] {
  if (order && order.length === question.choices.length) {
    return order.slice();
  }
  return question.choices.map((_, i) => i);
}

/**
 * Visual state of one choice.
 * - not revealed: the chosen option is `selected` (exam mode), the rest `idle`;
 * - revealed: the right answer is `correct` (if picked) or `missed`, a wrong pick is
 *   `incorrect`, everything else is `dimmed`.
 */
export function choiceStateFor(
  original: number,
  {answer, chosen, revealed}: {answer: number; chosen: number | null | undefined; revealed: boolean},
): ChoiceState {
  if (!revealed) {
    return chosen === original ? 'selected' : 'idle';
  }
  if (original === answer) {
    return chosen === original ? 'correct' : 'missed';
  }
  return chosen === original ? 'incorrect' : 'dimmed';
}

export type Verdict = 'correct' | 'incorrect' | 'unanswered';

export function verdictFor(question: Question, chosen: number | null | undefined): Verdict {
  if (chosen === null || chosen === undefined) {
    return 'unanswered';
  }
  return chosen === question.answer ? 'correct' : 'incorrect';
}

/** "B: Come to a complete stop" — the correct answer as the learner saw it. */
export function correctAnswerText(question: Question, order?: readonly number[] | null): string {
  const shown = displayOrder(question, order);
  const pos = Math.max(0, shown.indexOf(question.answer));
  return `${letterAt(pos)}: ${question.choices[question.answer] ?? ''}`;
}

/** Text for read-aloud: the prompt and options, plus the answer + explanation once revealed. */
export function speechTextFor(question: Question, order?: readonly number[] | null, revealed = false): string {
  const t = tr(STR);
  const shown = displayOrder(question, order);
  const options = shown.map((original, pos) => t.option(letterAt(pos), question.choices[original])).join(' ');
  const base = `${question.prompt} ${options}`;
  if (!revealed) {
    return base;
  }
  return `${base} ${t.correctIs(correctAnswerText(question, order))} ${question.explanation}`;
}

/** mailto: link for "Report a problem" (includes the stable question id). */
export function reportMailto(question: Question): string {
  const t = tr(STR);
  const subject = t.reportSubject(question.id);
  const body = [
    t.reportId(question.id),
    t.reportQuestion(question.prompt),
    '',
    t.reportAsk,
    '',
  ].join('\n');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// English patterns, plus the Spanish ones for translated prompts (¿Qué significa esta señal?...).
const ASKS_MEANING =
  /\bmean|what (?:does|do|is|are) (?:this|these)|\bthis (?:sign|signal|marking|symbol|shape|light|arrow)|\bshown\b|\bpictured\b|\bsignifican?\b|qu[eé] (?:indica|indican|quiere decir|quieren decir)|\best[ae]s? (?:señal|señales|semáforo|semáforos|marca|marcas|símbolo|forma|luz|luces|flecha|flechas)\b|\bmostrad[ao]s?\b|\bse muestra|\ben la imagen/i;

/**
 * Screen-reader label for a question's sign image. While the answer is hidden we
 * must not read the sign's name when that would give the answer away; once the
 * answer is revealed the default label (the sign's name) is helpful.
 *  - `undefined` → SignImage's default ("Stop sign")
 *  - `''` → hidden from screen readers
 */
export function signLabelFor(question: Question, revealed: boolean): string | undefined {
  if (!question.sign || revealed) {
    return undefined;
  }
  const sign = getSign(question.sign);
  if (sign?.category === 'scenario') {
    // A scene's description is what the picture shows; screen-reader users need it to answer.
    return tr(STR).picture(sign.meaning);
  }
  const name = sign?.name.toLowerCase();
  const leaksName = !!name && question.choices.some(c => c.toLowerCase().includes(name));
  return ASKS_MEANING.test(question.prompt) || leaksName ? '' : undefined;
}

/** 0–100 integer percentage, 0 when the denominator is 0. */
export function percent(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

/** "in 3 days", "now", "tomorrow"... for a future timestamp. */
export function relativeFuture(at: number, now: number = Date.now()): string {
  const t = tr(STR);
  const diff = at - now;
  if (diff <= 60 * 1000) {
    return t.now;
  }
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) {
    return t.inMinutes(minutes);
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return t.inHours(hours);
  }
  const days = Math.round(hours / 24);
  return days === 1 ? t.tomorrow : t.inDays(days);
}

/** "just now", "5 min ago", "yesterday", "3 days ago"... for a past timestamp. */
export function relativePast(at: number, now: number = Date.now()): string {
  const t = tr(STR);
  const diff = Math.max(0, now - at);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) {
    return t.justNow;
  }
  if (minutes < 60) {
    return t.minutesAgo(minutes);
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return t.hoursAgo(hours);
  }
  const days = Math.floor(hours / 24);
  if (days === 1) {
    return t.yesterday;
  }
  return days < 30 ? t.daysAgo(days) : formatDate(at);
}

/** Short date like "Oct 12" / "12 oct" for history rows. */
export function shortDate(at: number): string {
  const d = new Date(at);
  return tr(STR).shortDate(d.getMonth(), d.getDate());
}
