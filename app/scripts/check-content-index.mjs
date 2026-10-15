#!/usr/bin/env node
/**
 * Fails if src/content/index.ts is out of date: every file it requires must exist and match the
 * SHA-256 recorded in `bundledHashes` (content updates rely on those hashes), and every committed
 * content file under questions/, states/, lessons/ and i18n/ must be indexed unless deliberately
 * excluded (pass the same EXCLUDE_STATES / EXCLUDE_FILES used when building the index).
 *
 *   node scripts/check-content-index.mjs
 */
import {createHash} from 'node:crypto';
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(APP, 'src', 'content');
const index = readFileSync(join(CONTENT, 'index.ts'), 'utf8');
const problems = [];

const hashes = Object.fromEntries([...index.matchAll(/^ {2}'([^']+)': '([0-9a-f]{64})',$/gm)].map(m => [m[1], m[2]]));
const required = [...index.matchAll(/load\('([^']+)', \(\) => require\('\.\/([^']+)'\)\)/g)].map(m => {
  if (m[1] !== m[2]) {
    problems.push(`load key ${m[1]} does not match its require path ${m[2]}`);
  }
  return m[1];
});

for (const path of required) {
  const file = join(CONTENT, path);
  if (!existsSync(file)) {
    problems.push(`missing file: ${path}`);
  } else if (hashes[path] !== createHash('sha256').update(readFileSync(file)).digest('hex')) {
    problems.push(`stale hash (re-run build-content-index): ${path}`);
  }
}

const exStates = new Set((process.env.EXCLUDE_STATES ?? '').split(',').map(s => s.trim()).filter(Boolean));
const exFiles = new Set((process.env.EXCLUDE_FILES ?? '').split(',').map(s => s.trim()).filter(Boolean));
const walk = dir =>
  existsSync(dir)
    ? readdirSync(dir).flatMap(n => {
        const p = join(dir, n);
        return statSync(p).isDirectory() ? walk(p) : n.endsWith('.json') && !n.startsWith('_') ? [p] : [];
      })
    : [];
const indexed = new Set(required);
for (const dir of ['questions', 'states', 'lessons', 'i18n']) {
  for (const f of walk(join(CONTENT, dir))) {
    const path = relative(CONTENT, f).split('\\').join('/');
    const state = path.match(/(?:questions\/states|states)\/([A-Z]{2})\.json$/);
    if (!indexed.has(path) && !(state && exStates.has(state[1])) && !exFiles.has(path.split('/').pop())) {
      problems.push(`not indexed (run build-content-index, or exclude it on purpose): ${path}`);
    }
  }
}

for (const p of problems) {
  console.log('ERROR ' + p);
}
console.log(`content index: ${required.length} files checked, ${problems.length} problems`);
process.exit(problems.length ? 1 : 0);
