#!/usr/bin/env node
/**
 * Translation workflow helper. Translations live in src/content/i18n/<lang>/, mirroring the
 * English paths, and every entry carries the fingerprint of the English it was made from.
 *
 *   node scripts/i18n.mjs status [lang]
 *       Coverage per file: translated / missing / stale (English changed since translation).
 *
 *   node scripts/i18n.mjs export <lang> <source> [--all] > work.json
 *       Writes the English items that still need translating (missing or stale; --all = every item).
 *       <source> is one of:
 *         src/content/questions/<track|states>/<file>.json   -> [{id, prompt, choices, explanation}]
 *         src/content/lessons/<track>/<file>.json            -> {title, summary, sections, keyPoints}
 *         src/content/states/<XX>.json                       -> [{h, en}]  (state facts/laws/exam text)
 *         signs                                              -> [{code, name, meaning, shape, colors}]
 *
 *   node scripts/i18n.mjs import <lang> <source> <translated.json>
 *       Merges translations into the translation file, stamping fingerprints from the CURRENT English.
 *       Translated formats (same order/keys as the export):
 *         questions: {"<id>": {"p": "...", "c": ["...", ...], "e": "..."}}
 *         lesson:    {title, summary, sections, keyPoints}   (same structure, same sign codes)
 *         state:     {"<h>": "<translated string>"}
 *         signs:     {"<code>": {name, meaning, shape, colors}}
 */
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {
  APP,
  CONTENT,
  I18N,
  LANGS,
  lessonHash,
  listJson,
  loadSigns,
  questionHash,
  readJson,
  sameNumbers,
  signHash,
  stateStrings,
  textHash,
  translationPath,
} from './i18n-lib.mjs';
import {existsSync} from 'node:fs';

const [cmd, ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter(a => a.startsWith('--')));
const args = rest.filter(a => !a.startsWith('--'));

const die = msg => {
  console.error(msg);
  process.exit(1);
};
const write = (file, data) => {
  mkdirSync(dirname(file), {recursive: true});
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
};
const kindOf = source => {
  if (source === 'signs') {
    return 'signs';
  }
  const r = relative(CONTENT, resolve(source));
  if (r.startsWith('questions/')) {
    return 'questions';
  }
  if (r.startsWith('lessons/')) {
    return 'lesson';
  }
  if (r.startsWith('states/')) {
    return 'state';
  }
  return die(`unsupported source: ${source}`);
};
const SIGNS_FILE = lang => join(I18N, lang, 'signs', 'signs.json');
const load = (file, fallback) => (existsSync(file) ? readJson(file) : fallback);

/** Same shape (section count, block types/counts, sign codes, table sizes)? Returns an error or null. */
function lessonShapeError(en, tr) {
  if (!tr || typeof tr.title !== 'string' || typeof tr.summary !== 'string' || !Array.isArray(tr.sections) || !Array.isArray(tr.keyPoints)) {
    return 'missing title/summary/sections/keyPoints';
  }
  if (tr.sections.length !== en.sections.length) {
    return `sections ${tr.sections.length} != ${en.sections.length}`;
  }
  if (tr.keyPoints.length !== en.keyPoints.length) {
    return `keyPoints ${tr.keyPoints.length} != ${en.keyPoints.length}`;
  }
  for (let i = 0; i < en.sections.length; i++) {
    const a = en.sections[i].blocks;
    const b = tr.sections[i].blocks ?? [];
    if (a.length !== b.length) {
      return `section ${i + 1}: blocks ${b.length} != ${a.length}`;
    }
    for (let j = 0; j < a.length; j++) {
      if (a[j].type !== b[j].type) {
        return `section ${i + 1} block ${j + 1}: type ${b[j].type} != ${a[j].type}`;
      }
      if (a[j].code !== b[j].code || JSON.stringify(a[j].codes) !== JSON.stringify(b[j].codes)) {
        return `section ${i + 1} block ${j + 1}: sign codes must not change`;
      }
      for (const k of ['items', 'rows']) {
        if (a[j][k] && a[j][k].length !== (b[j][k] ?? []).length) {
          return `section ${i + 1} block ${j + 1}: ${k} count differs`;
        }
      }
    }
  }
  return null;
}

function status(lang) {
  const rows = [];
  const total = {done: 0, missing: 0, stale: 0};
  const add = (name, done, missing, stale) => {
    rows.push(`${name.padEnd(48)} ${String(done).padStart(5)} ${String(missing).padStart(7)} ${String(stale).padStart(5)}`);
    total.done += done;
    total.missing += missing;
    total.stale += stale;
  };
  for (const f of listJson(join(CONTENT, 'questions'))) {
    const qs = readJson(f);
    const t = load(translationPath(lang, f), {});
    let done = 0;
    let stale = 0;
    for (const q of qs) {
      const e = t[q.id];
      if (e) {
        e.h === questionHash(q) ? done++ : stale++;
      }
    }
    add(relative(CONTENT, f), done, qs.length - done - stale, stale);
  }
  for (const f of listJson(join(CONTENT, 'lessons'))) {
    const l = readJson(f);
    const t = load(translationPath(lang, f), null);
    add(relative(CONTENT, f), t && t.h === lessonHash(l) ? 1 : 0, t ? 0 : 1, t && t.h !== lessonHash(l) ? 1 : 0);
  }
  for (const f of listJson(join(CONTENT, 'states'))) {
    const strings = stateStrings(readJson(f));
    const t = load(translationPath(lang, f), {});
    const done = strings.filter(s => t[textHash(s)]).length;
    add(relative(CONTENT, f) + ' (strings)', done, strings.length - done, 0);
  }
  const signs = loadSigns();
  const ts = load(SIGNS_FILE(lang), {});
  const sdone = signs.filter(s => ts[s.code]?.h === signHash(s)).length;
  const sstale = signs.filter(s => ts[s.code] && ts[s.code].h !== signHash(s)).length;
  add('signs', sdone, signs.length - sdone - sstale, sstale);
  console.log(`${'file'.padEnd(48)} ${'done'.padStart(5)} ${'missing'.padStart(7)} ${'stale'.padStart(5)}`);
  console.log(rows.join('\n'));
  console.log(`TOTAL ${lang}: ${total.done} translated, ${total.missing} missing, ${total.stale} stale`);
}

function exportItems(lang, source) {
  const all = flags.has('--all');
  const kind = kindOf(source);
  if (kind === 'signs') {
    const t = load(SIGNS_FILE(lang), {});
    return loadSigns()
      .filter(s => all || t[s.code]?.h !== signHash(s))
      .map(({code, name, meaning, shape, colors}) => ({code, name, meaning, shape, colors}));
  }
  const file = resolve(source);
  if (kind === 'questions') {
    const t = load(translationPath(lang, file), {});
    return readJson(file)
      .filter(q => all || t[q.id]?.h !== questionHash(q))
      .map(q => ({id: q.id, prompt: q.prompt, choices: q.choices, explanation: q.explanation}));
  }
  if (kind === 'lesson') {
    const l = readJson(file);
    const t = load(translationPath(lang, file), null);
    if (!all && t && t.h === lessonHash(l)) {
      return null;
    }
    return {title: l.title, summary: l.summary, sections: l.sections, keyPoints: l.keyPoints};
  }
  const t = load(translationPath(lang, file), {});
  return stateStrings(readJson(file))
    .filter(s => all || !t[textHash(s)])
    .map(s => ({h: textHash(s), en: s}));
}

function importItems(lang, source, workFile) {
  const kind = kindOf(source);
  const tr = readJson(resolve(workFile));
  const problems = [];
  if (kind === 'signs') {
    const target = SIGNS_FILE(lang);
    const out = load(target, {});
    const byCode = new Map(loadSigns().map(s => [s.code, s]));
    for (const [code, t] of Object.entries(tr)) {
      const s = byCode.get(code);
      if (!s) {
        problems.push(`${code}: unknown sign code`);
      } else if (!t.name || !t.meaning || !t.shape) {
        problems.push(`${code}: name, meaning and shape are required`);
      } else if (!sameNumbers(s.meaning, t.meaning)) {
        problems.push(`${code}: numbers differ from the English meaning`);
      } else {
        out[code] = {h: signHash(s), name: t.name, meaning: t.meaning, shape: t.shape, colors: t.colors ?? ''};
      }
    }
    write(target, Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b))));
    return {target, count: Object.keys(tr).length - problems.length, problems};
  }
  const file = resolve(source);
  const target = translationPath(lang, file);
  if (kind === 'questions') {
    const qs = readJson(file);
    const byId = new Map(qs.map(q => [q.id, q]));
    const out = load(target, {});
    for (const [id, t] of Object.entries(tr)) {
      const q = byId.get(id);
      if (!q) {
        problems.push(`${id}: not in ${relative(APP, file)}`);
      } else if (typeof t.p !== 'string' || !t.p.trim() || typeof t.e !== 'string' || !t.e.trim() || !Array.isArray(t.c)) {
        problems.push(`${id}: needs p, c and e`);
      } else if (t.c.length !== q.choices.length || t.c.some(c => typeof c !== 'string' || !c.trim())) {
        problems.push(`${id}: needs exactly ${q.choices.length} non-empty choices, in the English order`);
      } else if (!sameNumbers(q.prompt, t.p) || !sameNumbers(q.explanation, t.e) || q.choices.some((c, i) => !sameNumbers(c, t.c[i]))) {
        problems.push(`${id}: numbers differ from the English (keep every number exactly as written)`);
      } else {
        out[id] = {p: t.p, c: t.c, e: t.e, h: questionHash(q)};
      }
    }
    // Keep the English order so diffs stay readable.
    write(target, Object.fromEntries(qs.filter(q => out[q.id]).map(q => [q.id, out[q.id]])));
    return {target, count: Object.keys(tr).length - problems.length, problems};
  }
  if (kind === 'lesson') {
    const l = readJson(file);
    const shape = lessonShapeError(l, tr);
    if (shape) {
      return {target, count: 0, problems: [`${l.id}: ${shape}`]};
    }
    write(target, {id: l.id, h: lessonHash(l), title: tr.title, summary: tr.summary, sections: tr.sections, keyPoints: tr.keyPoints});
    return {target, count: 1, problems};
  }
  const strings = new Map(stateStrings(readJson(file)).map(s => [textHash(s), s]));
  const out = load(target, {});
  for (const [h, es] of Object.entries(tr)) {
    const en = strings.get(h);
    if (!en) {
      problems.push(`${h}: not a current string of ${relative(APP, file)}`);
    } else if (typeof es !== 'string' || !es.trim()) {
      problems.push(`${h}: empty translation`);
    } else if (!sameNumbers(en, es)) {
      problems.push(`${h}: numbers differ from the English "${en.slice(0, 60)}..."`);
    } else {
      out[h] = es;
    }
  }
  // Drop entries for strings that no longer exist in the English.
  write(target, Object.fromEntries([...strings.keys()].filter(h => out[h]).map(h => [h, out[h]])));
  return {target, count: Object.keys(tr).length - problems.length, problems};
}

if (cmd === 'status') {
  status(args[0] ?? 'es');
} else if (cmd === 'export') {
  const [lang, source] = args;
  if (!LANGS.includes(lang) || !source) {
    die('usage: export <lang> <source> [--all]');
  }
  console.log(JSON.stringify(exportItems(lang, source), null, 2));
} else if (cmd === 'import') {
  const [lang, source, workFile] = args;
  if (!LANGS.includes(lang) || !source || !workFile) {
    die('usage: import <lang> <source> <translated.json>');
  }
  const r = importItems(lang, source, workFile);
  console.log(`${relative(APP, r.target)}: imported ${r.count}`);
  for (const p of r.problems) {
    console.log('PROBLEM ' + p);
  }
  process.exit(r.problems.length ? 1 : 0);
} else {
  die('usage: node scripts/i18n.mjs status|export|import ... (see the header of this file)');
}
