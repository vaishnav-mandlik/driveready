/**
 * Pure helpers shared by the quiz screens and the QuestionCard family.
 * Nothing here touches React or the stores, so it is cheap to unit-test.
 */
import type {ChoiceState} from '../ChoiceButton';
import {getSign} from '../../data/signs';
import type {Question} from '../../data/types';

export {SUPPORT_EMAIL} from '../../config';
import {SUPPORT_EMAIL} from '../../config';

const LETTERS = 'ABCDEFGH';

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
  const shown = displayOrder(question, order);
  const options = shown.map((original, pos) => `Option ${letterAt(pos)}: ${question.choices[original]}.`).join(' ');
  const base = `${question.prompt} ${options}`;
  if (!revealed) {
    return base;
  }
  return `${base} The correct answer is ${correctAnswerText(question, order)}. ${question.explanation}`;
}

/** mailto: link for "Report a problem" (includes the stable question id). */
export function reportMailto(question: Question): string {
  const subject = `Question ${question.id}: problem report`;
  const body = [
    `Question ID: ${question.id}`,
    `Question: ${question.prompt}`,
    '',
    'What looks wrong? (answer, explanation, typo, outdated law...)',
    '',
  ].join('\n');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const ASKS_MEANING = /\bmean|what (?:does|do|is|are) (?:this|these)|\bthis (?:sign|signal|marking|symbol|shape|light|arrow)|\bshown\b|\bpictured\b/i;

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
    return `Picture: ${sign.meaning}`;
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
  const diff = at - now;
  if (diff <= 60 * 1000) {
    return 'now';
  }
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) {
    return `in ${minutes} min`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `in ${hours} hr`;
  }
  const days = Math.round(hours / 24);
  return days === 1 ? 'tomorrow' : `in ${days} days`;
}

/** "just now", "5 min ago", "yesterday", "3 days ago"... for a past timestamp. */
export function relativePast(at: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - at);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) {
    return 'yesterday';
  }
  return days < 30 ? `${days} days ago` : new Date(at).toLocaleDateString();
}

/** Short date like "Oct 12" for history rows. */
export function shortDate(at: number): string {
  const d = new Date(at);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}
