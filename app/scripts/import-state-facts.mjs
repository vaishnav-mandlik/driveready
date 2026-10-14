#!/usr/bin/env node
/**
 * Converts verified research facts (../research/facts/XX.json) into app
 * StateInfo files (src/content/states/XX.json).
 *
 *   node scripts/import-state-facts.mjs            # all states with facts
 *   node scripts/import-state-facts.mjs CA TX      # only these
 *
 * Facts/laws the verifier marked "unverified" are dropped: the app only
 * teaches what was confirmed against an official source.
 */
import {existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const FACTS = join(APP, '..', 'research', 'facts');
const OUT = join(APP, 'src', 'content', 'states');
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

const wanted = process.argv.slice(2).map(s => s.toUpperCase());
const files = existsSync(FACTS)
  ? readdirSync(FACTS).filter(f => /^[A-Z]{2}\.json$/.test(f) && (!wanted.length || wanted.includes(f.slice(0, 2))))
  : [];

const int = v => (Number.isInteger(v) && v > 0 ? v : null);
const num = v => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);
const str = v => (typeof v === 'string' && v.trim() ? v.trim() : null);

function exam(t, fallbackNote) {
  const questions = int(t?.questions);
  const percent = num(t?.passingPercent);
  let passingScore = int(t?.passingScore);
  if (questions && !passingScore && percent) {
    passingScore = Math.ceil((questions * percent) / 100);
  }
  if (questions && passingScore && passingScore > questions) {
    passingScore = null;
  }
  const notes = [str(t?.notes)].filter(Boolean);
  const q = questions ?? 40;
  const p = passingScore ?? Math.ceil(q * ((percent ?? 80) / 100));
  if (!questions && percent) {
    notes.push(`The official site does not publish the number of questions; this practice exam uses ${q} questions at the official ${percent}% passing standard.`);
  } else if (!questions || !passingScore) {
    notes.push(fallbackNote);
  }
  return {
    questions: q,
    passingScore: p,
    passingPercent: Math.round((p / q) * 1000) / 10,
    timeLimitMinutes: int(t?.timeLimitMinutes),
    roadSigns: str(t?.roadSigns),
    format: str(t?.format),
    languages: str(t?.languages),
    retestWait: str(t?.retestWait),
    notes: notes.join(' '),
    sourceUrl: str(t?.sourceUrl) ?? '',
  };
}

function special(t) {
  if (!t) {
    return null;
  }
  const out = {
    questions: int(t.questions) ?? undefined,
    passingScore: int(t.passingScore) ?? undefined,
    passingPercent: num(t.passingPercent) ?? undefined,
    notes: str(t.notes) ?? undefined,
    sourceUrl: str(t.sourceUrl) ?? undefined,
  };
  if (out.questions && !out.passingScore && out.passingPercent) {
    out.passingScore = Math.ceil((out.questions * out.passingPercent) / 100);
  }
  return out.questions || out.passingPercent ? JSON.parse(JSON.stringify(out)) : null;
}

let written = 0;
for (const f of files) {
  const code = f.slice(0, 2);
  const r = JSON.parse(readFileSync(join(FACTS, f), 'utf8'));
  const keep = x => x && x.status !== 'unverified';
  const seen = new Set();
  const facts = (r.facts ?? [])
    .filter(keep)
    .filter(x => (seen.has(x.key) ? false : seen.add(x.key)))
    .map(x => ({
      key: x.key,
      value: x.value,
      detail: x.detail,
      number: x.number ?? null,
      unit: x.unit ?? null,
      source: {url: x.source?.url ?? r.handbook?.url ?? '', page: x.source?.page ?? null, quote: x.source?.quote ?? ''},
    }));
  const info = {
    code,
    name: r.name,
    agency: r.agency,
    handbook: {title: r.handbook?.title ?? 'Driver Handbook', edition: r.handbook?.edition ?? '', url: r.handbook?.url ?? ''},
    exam: exam(r.knowledgeTest, 'Some test details could not be confirmed; check your state agency before test day.'),
    motorcycleExam: special(r.motorcycleTest),
    cdlExam: special(r.cdlTest),
    facts,
    notableLaws: (r.notableLaws ?? []).filter(keep).map(l => ({title: l.title, summary: l.summary, source: l.source})),
    officialPracticeTests: r.officialPracticeTests ?? [],
    verifiedOn: today,
  };
  writeFileSync(join(OUT, `${code}.json`), JSON.stringify(info, null, 2) + '\n');
  written++;
  const dropped = (r.facts ?? []).length - facts.length;
  console.log(`${code}: ${facts.length} facts (${dropped} dropped), ${info.notableLaws.length} laws, exam ${info.exam.questions}q/${info.exam.passingScore}`);
}
console.log(`wrote ${written} state file(s)`);
