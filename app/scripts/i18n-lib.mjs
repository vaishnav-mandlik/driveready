/**
 * Shared helpers for translation tooling (scripts/i18n.mjs, scripts/validate-content.mjs).
 * The fingerprint functions MUST stay identical to src/i18n/hash.ts.
 */
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

export const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
export const CONTENT = join(APP, 'src', 'content');
export const I18N = join(CONTENT, 'i18n');
export const LANGS = ['es'];

export function fnv1a(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

const SEP = '␞';
export const questionHash = q => fnv1a([q.prompt, ...q.choices, q.explanation].join(SEP));
export const lessonHash = l => fnv1a(JSON.stringify([l.title, l.summary, l.sections, l.keyPoints]));
export const signHash = s => fnv1a([s.name, s.meaning, s.shape, s.colors].join(SEP));
export const textHash = t => fnv1a(t);

export const readJson = f => JSON.parse(readFileSync(f, 'utf8'));

export function listJson(dir) {
  return existsSync(dir)
    ? readdirSync(dir)
        .flatMap(n => {
          const p = join(dir, n);
          return statSync(p).isDirectory() ? listJson(p) : n.endsWith('.json') && !n.startsWith('_') ? [p] : [];
        })
        .sort()
    : [];
}

/** Translation file for an English source file (same path under src/content/i18n/<lang>/). */
export const translationPath = (lang, sourceFile) => join(I18N, lang, relative(CONTENT, sourceFile));
/** English source file for a translation file. */
export const sourcePath = (lang, translationFile) => join(CONTENT, relative(join(I18N, lang), translationFile));

/** Every translatable string of a state info file (exam notes, facts, laws), deduplicated. */
export function stateStrings(info) {
  const out = [];
  const add = s => {
    if (typeof s === 'string' && s.trim()) {
      out.push(s);
    }
  };
  for (const exam of [info.exam, info.motorcycleExam, info.cdlExam]) {
    if (exam) {
      for (const k of ['roadSigns', 'format', 'languages', 'retestWait', 'notes']) {
        add(exam[k]);
      }
    }
  }
  for (const f of info.facts ?? []) {
    add(f.value);
    add(f.detail);
  }
  for (const l of info.notableLaws ?? []) {
    add(l.title);
    add(l.summary);
  }
  return [...new Set(out)];
}

/** Sign registry (name/meaning/shape/colors) parsed from the generated src/content/signs/index.ts. */
export function loadSigns() {
  const ts = readFileSync(join(CONTENT, 'signs', 'index.ts'), 'utf8');
  return [...ts.matchAll(/^\s*(\{"code":.*\}),?\s*$/gm)].map(m => {
    // Photo entries end with `, image: require('...')}`, which is not JSON.
    const {code, name, meaning, shape, colors, category} = JSON.parse(m[1].replace(/, image: require\('[^']*'\)\}$/, '}'));
    return {code, name, meaning, shape, colors, category};
  });
}

/** Digit groups in a string ("15 feet, 0.08%" -> ["15", "0.08"]), sorted, for number-preservation checks. */
export const numbersIn = s => (String(s).match(/\d+(?:[.,]\d+)*/g) ?? []).sort();
export const sameNumbers = (a, b) => JSON.stringify(numbersIn(a)) === JSON.stringify(numbersIn(b));
