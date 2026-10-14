// Runs a workflow script with stub agent() that records prompts instead of spawning agents.
// usage: node prompts.mjs <script.js> '<args json>' <outdir>
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
const [script, argsJson, outdir] = process.argv.slice(2);
mkdirSync(outdir, {recursive: true});
let src = readFileSync(script, 'utf8').replace(/export const meta/, 'const meta');
const prompts = [];
const agent = async (prompt, opts = {}) => {
  prompts.push({label: opts.label || 'agent' + prompts.length, prompt});
  // fake a non-null result so later stages also produce prompts
  const arr = Object.assign([], {slice: () => []});
  return new Proxy({}, {get: (t, k) => (k === 'then' ? undefined : k === 'toJSON' ? undefined : new Proxy(function () {}, {get: (_, kk) => (kk === 'slice' ? () => [] : kk === Symbol.toPrimitive ? () => 1 : kk === 'length' ? 0 : undefined)}))});
};
const pipeline = async (items, ...stages) => {
  const out = [];
  for (let i = 0; i < items.length; i++) {
    let r = items[i];
    for (const st of stages) r = await st(r, items[i], i);
    out.push(r);
  }
  return out;
};
const parallel = async thunks => Promise.all(thunks.map(t => t()));
const fn = new Function('agent', 'pipeline', 'parallel', 'phase', 'log', 'args', 'budget', `return (async () => {${src}\n})()`);
try { await fn(agent, pipeline, parallel, () => {}, () => {}, JSON.parse(argsJson), {total: null}); } catch (e) { console.error('post-processing error ignored:', e.message); }
for (const p of prompts) writeFileSync(`${outdir}/${p.label.replace(/[^a-z0-9.-]+/gi, '_')}.txt`, p.prompt);
console.log(prompts.map(p => p.label).join('\n'));
