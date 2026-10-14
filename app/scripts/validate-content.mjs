#!/usr/bin/env node
/**
 * Strict integrity checks for all bundled content. Exit code 1 on any error.
 *
 *   node scripts/validate-content.mjs            # everything
 *   node scripts/validate-content.mjs <file...>  # only these question/lesson/state files
 *                                                  (ids are still checked against all files)
 *   --quiet  only print errors + totals
 */
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {basename, dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {I18N, LANGS, lessonHash, loadSigns, questionHash, sameNumbers, signHash, sourcePath, stateStrings, textHash} from './i18n-lib.mjs';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(APP, 'src', 'content');
const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const only = new Set(args.filter(a => !a.startsWith('--')).map(a => resolve(a)));

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${relative(APP, file)}: ${msg}`);
const warn = (file, msg) => warnings.push(`${relative(APP, file)}: ${msg}`);

// ---- vocabularies (single source of truth = the TS files) -----------------
const tracksTs = readFileSync(join(APP, 'src/data/tracks.ts'), 'utf8');
const TOPICS = {};
for (const m of tracksTs.matchAll(/\{id: '([a-z0-9-]+)', track: '(car|motorcycle|cdl)'/g)) {
  (TOPICS[m[2]] ??= new Set()).add(m[1]);
}
const typesTs = readFileSync(join(APP, 'src/data/types.ts'), 'utf8');
const STATES = new Set(
  [...typesTs.match(/export type StateCode =([\s\S]*?);/)[1].matchAll(/'([A-Z]{2})'/g)].map(m => m[1]),
);
const FACT_KEYS = new Set(
  [...typesTs.match(/export type FactKey =([\s\S]*?);/)[1].matchAll(/'([a-z0-9_]+)'/g)].map(m => m[1]),
);
const signCodesFile = join(CONTENT, 'signs', '_codes.json');
const SIGNS = new Set(existsSync(signCodesFile) ? JSON.parse(readFileSync(signCodesFile, 'utf8')) : []);

// ---- helpers ---------------------------------------------------------------
const listJson = dir =>
  existsSync(dir)
    ? readdirSync(dir)
        .flatMap(n => {
          const p = join(dir, n);
          return statSync(p).isDirectory() ? listJson(p) : n.endsWith('.json') && !n.startsWith('_') ? [p] : [];
        })
        .sort()
    : [];

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    err(file, `invalid JSON: ${e.message}`);
    return null;
  }
}

const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const ORDER_DEPENDENT = /\b(all|none|both|neither) of (the )?(above|these|them)\b|^(both|neither)\b|\b(a|b|c|d) and (a|b|c|d)\b/i;
const BANNED = [/dmv\.org/i, /lorem ipsum/i, /\bTODO\b/, /\bTBD\b/];

// ---- questions --------------------------------------------------------------
const questionFiles = [
  ...['car', 'motorcycle', 'cdl'].flatMap(t => listJson(join(CONTENT, 'questions', t)).map(f => ({f, track: t}))),
  ...listJson(join(CONTENT, 'questions', 'states')).map(f => ({f, track: null})),
];
const ids = new Map();
const prompts = new Map();
const counts = {};
let questionTotal = 0;

for (const {f, track} of questionFiles) {
  const check = only.size === 0 || only.has(resolve(f));
  const data = readJson(f);
  if (!data) {
    continue;
  }
  if (!Array.isArray(data)) {
    err(f, 'must be a JSON array of questions');
    continue;
  }
  const fileState = track ? null : basename(f, '.json');
  if (fileState && !STATES.has(fileState)) {
    err(f, `file name must be a state code, got ${fileState}`);
  }
  data.forEach((q, i) => {
    const where = `#${i} (${q && q.id})`;
    if (!q || typeof q !== 'object') {
      return err(f, `${where} not an object`);
    }
    if (ids.has(q.id)) {
      err(f, `${where} duplicate id (also in ${relative(APP, ids.get(q.id))})`);
    }
    ids.set(q.id, f);
    questionTotal++;
    const key = `${q.track}/${fileState ?? 'universal'}`;
    counts[key] = (counts[key] ?? 0) + 1;
    if (!check) {
      return;
    }
    const allowed = new Set(['id', 'track', 'topic', 'prompt', 'choices', 'answer', 'explanation', 'sign', 'states', 'difficulty', 'lockOrder', 'ref']);
    for (const k of Object.keys(q)) {
      if (!allowed.has(k)) {
        err(f, `${where} unknown field "${k}"`);
      }
    }
    if (typeof q.id !== 'string' || !/^[a-z0-9][a-z0-9.-]{2,60}$/.test(q.id)) {
      err(f, `${where} id must match /^[a-z0-9][a-z0-9.-]{2,60}$/`);
    }
    if (!['car', 'motorcycle', 'cdl'].includes(q.track)) {
      err(f, `${where} bad track ${q.track}`);
    } else {
      if (track && q.track !== track) {
        err(f, `${where} track ${q.track} does not match folder ${track}`);
      }
      if (!TOPICS[q.track]?.has(q.topic)) {
        err(f, `${where} topic "${q.topic}" is not a ${q.track} topic`);
      }
    }
    if (typeof q.prompt !== 'string' || q.prompt.trim().length < 12) {
      err(f, `${where} prompt too short`);
    } else if (q.prompt.length > 320) {
      warn(f, `${where} prompt is long (${q.prompt.length} chars)`);
    }
    if (!Array.isArray(q.choices) || q.choices.length < 2 || q.choices.length > 4) {
      err(f, `${where} needs 2-4 choices`);
    } else {
      const seen = new Set();
      q.choices.forEach((c, ci) => {
        if (typeof c !== 'string' || !c.trim()) {
          err(f, `${where} choice ${ci} empty`);
          return;
        }
        if (c.length > 180) {
          warn(f, `${where} choice ${ci} is long (${c.length} chars)`);
        }
        const n = norm(c);
        if (seen.has(n)) {
          err(f, `${where} duplicate choice "${c}"`);
        }
        seen.add(n);
        if (ORDER_DEPENDENT.test(c) && !q.lockOrder) {
          err(f, `${where} choice "${c}" depends on order: set "lockOrder": true or rewrite`);
        }
      });
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.choices.length) {
        err(f, `${where} answer index out of range`);
      }
    }
    if (typeof q.explanation !== 'string' || q.explanation.trim().length < 25) {
      err(f, `${where} explanation missing/too short`);
    }
    if (q.sign !== undefined && !SIGNS.has(q.sign)) {
      err(f, `${where} unknown sign code "${q.sign}"`);
    }
    if (q.states !== undefined) {
      if (!Array.isArray(q.states) || !q.states.length || q.states.some(s => !STATES.has(s))) {
        err(f, `${where} states must be a non-empty array of state codes`);
      }
    }
    if (fileState && (!Array.isArray(q.states) || !q.states.includes(fileState))) {
      err(f, `${where} state file questions must include "states": ["${fileState}"]`);
    }
    if (q.difficulty !== undefined && ![1, 2, 3].includes(q.difficulty)) {
      err(f, `${where} difficulty must be 1, 2 or 3`);
    }
    if (q.lockOrder !== undefined && typeof q.lockOrder !== 'boolean') {
      err(f, `${where} lockOrder must be boolean`);
    }
    const text = [q.prompt, ...(q.choices ?? []), q.explanation].join(' ');
    for (const b of BANNED) {
      if (b.test(text)) {
        err(f, `${where} contains banned text ${b}`);
      }
    }
    const np = norm(q.prompt) + '|' + (q.sign ?? '') + '|' + (q.states ?? []).join(',');
    if (prompts.has(np)) {
      warn(f, `${where} duplicate prompt (also ${prompts.get(np)})`);
    }
    prompts.set(np, q.id);
  });
}

// ---- state info --------------------------------------------------------------
for (const f of listJson(join(CONTENT, 'states'))) {
  if (only.size && !only.has(resolve(f))) {
    continue;
  }
  const s = readJson(f);
  if (!s) {
    continue;
  }
  const code = basename(f, '.json');
  if (s.code !== code) {
    err(f, `code ${s.code} != file name`);
  }
  for (const k of ['name', 'agency', 'handbook', 'exam', 'facts', 'notableLaws', 'verifiedOn']) {
    if (s[k] === undefined) {
      err(f, `missing ${k}`);
    }
  }
  const e = s.exam ?? {};
  if (!(Number.isInteger(e.questions) && e.questions > 0)) {
    err(f, 'exam.questions must be a positive integer');
  }
  if (!(Number.isInteger(e.passingScore) && e.passingScore > 0 && e.passingScore <= e.questions)) {
    err(f, 'exam.passingScore must be 1..questions');
  }
  for (const fact of s.facts ?? []) {
    if (!FACT_KEYS.has(fact.key)) {
      err(f, `unknown fact key ${fact.key}`);
    }
    if (!fact.value || !fact.detail || !fact.source?.url) {
      err(f, `fact ${fact.key} missing value/detail/source`);
    }
  }
}

// ---- lessons -----------------------------------------------------------------
const lessonIds = new Set();
const BLOCKS = new Set(['p', 'bullets', 'steps', 'tip', 'warning', 'sign', 'signs', 'table']);
for (const f of listJson(join(CONTENT, 'lessons'))) {
  const l = readJson(f);
  if (!l) {
    continue;
  }
  if (lessonIds.has(l.id)) {
    err(f, `duplicate lesson id ${l.id}`);
  }
  lessonIds.add(l.id);
  if (only.size && !only.has(resolve(f))) {
    continue;
  }
  if (!['car', 'motorcycle', 'cdl'].includes(l.track)) {
    err(f, `bad track ${l.track}`);
  } else if (l.topic !== 'road-test' && !TOPICS[l.track]?.has(l.topic)) {
    err(f, `topic ${l.topic} not in ${l.track}`);
  }
  for (const k of ['title', 'summary']) {
    if (typeof l[k] !== 'string' || !l[k].trim()) {
      err(f, `missing ${k}`);
    }
  }
  if (!Number.isFinite(l.minutes)) {
    err(f, 'minutes must be a number');
  }
  if (!Array.isArray(l.sections) || !l.sections.length) {
    err(f, 'needs sections');
  }
  for (const [si, sec] of (l.sections ?? []).entries()) {
    if (!sec.heading) {
      err(f, `section ${si} missing heading`);
    }
    for (const [bi, b] of (sec.blocks ?? []).entries()) {
      if (!BLOCKS.has(b.type)) {
        err(f, `section ${si} block ${bi} bad type ${b.type}`);
      }
      const codes = b.type === 'sign' ? [b.code] : b.type === 'signs' ? b.codes ?? [] : [];
      for (const c of codes) {
        if (!SIGNS.has(c)) {
          err(f, `section ${si} block ${bi} unknown sign ${c}`);
        }
      }
      if (b.type === 'table' && !(Array.isArray(b.rows) && b.rows.every(r => Array.isArray(r) && r.length === 2))) {
        err(f, `section ${si} block ${bi} table rows must be [label, value] pairs`);
      }
    }
  }
  if (!Array.isArray(l.keyPoints) || !l.keyPoints.length) {
    err(f, 'needs keyPoints');
  }
}

// ---- translations (src/content/i18n/<lang>/, see scripts/i18n.mjs) ---------------
// Errors: broken structure or changed numbers. Stale entries (English edited after translating)
// are only warnings: the app shows the English for them until they are re-translated.
const translated = {};
for (const lang of LANGS) {
  const base = join(I18N, lang);
  let done = 0;
  let stale = 0;
  for (const f of listJson(base)) {
    if (only.size && !only.has(f)) {
      continue;
    }
    const t = readJson(f);
    if (!t) {
      continue;
    }
    const rel = relative(base, f).split('\\').join('/');
    if (rel.startsWith('signs/')) {
      const signs = new Map(loadSigns().map(x => [x.code, x]));
      for (const [code, e] of Object.entries(t)) {
        const src = signs.get(code);
        if (!src) {
          err(f, `${code}: unknown sign code`);
        } else if (!e.name || !e.meaning || !e.shape) {
          err(f, `${code}: needs name, meaning, shape`);
        } else if (!sameNumbers(src.meaning, e.meaning)) {
          err(f, `${code}: numbers differ from the English meaning`);
        } else if (e.h !== signHash(src)) {
          stale++;
          warn(f, `${code}: stale (English changed)`);
        } else {
          done++;
        }
      }
      continue;
    }
    const src = sourcePath(lang, f);
    if (!existsSync(src)) {
      err(f, `no English source at ${relative(APP, src)}`);
      continue;
    }
    const en = readJson(src);
    if (rel.startsWith('questions/')) {
      const byId = new Map(en.map(q => [q.id, q]));
      for (const [id, e] of Object.entries(t)) {
        const q = byId.get(id);
        if (!q) {
          warn(f, `${id}: question no longer exists (re-import to drop it)`);
        } else if (typeof e.p !== 'string' || !e.p.trim() || typeof e.e !== 'string' || !e.e.trim() || !Array.isArray(e.c) || e.c.length !== q.choices.length || e.c.some(c => typeof c !== 'string' || !c.trim())) {
          err(f, `${id}: needs p, e and ${q.choices.length} non-empty choices`);
        } else if (!sameNumbers(q.prompt, e.p) || !sameNumbers(q.explanation, e.e) || q.choices.some((c, i) => !sameNumbers(c, e.c[i]))) {
          err(f, `${id}: numbers differ from the English`);
        } else if (e.h !== questionHash(q)) {
          stale++;
          warn(f, `${id}: stale (English changed)`);
        } else {
          done++;
        }
      }
    } else if (rel.startsWith('lessons/')) {
      if (t.id !== en.id) {
        err(f, `id ${t.id} does not match ${en.id}`);
      } else if (t.h !== lessonHash(en)) {
        stale++;
        warn(f, 'stale lesson (English changed)');
      } else {
        done++;
      }
    } else if (rel.startsWith('states/')) {
      const strings = new Map(stateStrings(en).map(x => [textHash(x), x]));
      for (const [h, es] of Object.entries(t)) {
        const x = strings.get(h);
        if (!x) {
          warn(f, `${h}: string no longer in the English (re-import to drop it)`);
        } else if (typeof es !== 'string' || !es.trim()) {
          err(f, `${h}: empty translation`);
        } else if (!sameNumbers(x, es)) {
          err(f, `${h}: numbers differ from the English`);
        } else {
          done++;
        }
      }
    } else {
      err(f, 'unexpected translation file location');
    }
  }
  translated[lang] = {done, stale};
}

// ---- report --------------------------------------------------------------------
if (!quiet) {
  for (const w of warnings) {
    console.log('WARN  ' + w);
  }
}
for (const e of errors) {
  console.log('ERROR ' + e);
}
const byTrack = Object.entries(counts)
  .sort()
  .map(([k, v]) => `${k}=${v}`)
  .join(' ');
console.log(
  `\n${questionTotal} questions, ${lessonIds.size} lessons, ${SIGNS.size} sign codes | ${errors.length} errors, ${warnings.length} warnings`,
);
if (!quiet) {
  console.log(byTrack);
  for (const [lang, t] of Object.entries(translated)) {
    console.log(`translations ${lang}: ${t.done} current, ${t.stale} stale (run node scripts/i18n.mjs status ${lang})`);
  }
}
process.exit(errors.length ? 1 : 0);
