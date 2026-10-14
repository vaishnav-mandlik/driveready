/**
 * Fingerprints of English source text. Every translation stores the fingerprint of the English
 * it was made from; when the English changes, the fingerprint no longer matches and the app
 * shows the (corrected) English instead of an outdated translation.
 * Must stay identical to scripts/i18n-lib.mjs.
 */

/** 32-bit FNV-1a of a string, base 36. */
export function fnv1a(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

const SEP = '␞';

export function questionHash(q: {prompt: string; choices: string[]; explanation: string}): string {
  return fnv1a([q.prompt, ...q.choices, q.explanation].join(SEP));
}

export function lessonHash(l: {title: string; summary: string; sections: unknown; keyPoints: string[]}): string {
  return fnv1a(JSON.stringify([l.title, l.summary, l.sections, l.keyPoints]));
}

export function signHash(s: {name: string; meaning: string; shape: string; colors: string}): string {
  return fnv1a([s.name, s.meaning, s.shape, s.colors].join(SEP));
}

/** Single strings (state facts, laws, exam notes) are translated as a memory keyed by this. */
export function textHash(text: string): string {
  return fnv1a(text);
}
