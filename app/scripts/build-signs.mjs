#!/usr/bin/env node
/**
 * Builds the in-app sign registry (src/content/signs/index.ts + _codes.json)
 * from sign manifests:
 *   - ../research/signs/manifest_*.json  (public-domain MUTCD SVGs from Wikimedia Commons)
 *   - assets/signs-custom/manifest*.json  (app-drawn signals, pavement markings, hand signals)
 *   - assets/scenes/manifest*.json        (app-drawn scenario illustrations)
 *   - assets/photos/manifest*.json        (openly licensed photos/raster art: "file" + credit fields)
 *
 * Each SVG is optimized for react-native-svg's SvgXml (which ignores <style>):
 * CSS is inlined and converted to presentation attributes, editor metadata is
 * stripped, numbers are rounded.
 *
 *   node scripts/build-signs.mjs [--png <dir>]   # --png also renders optimized SVGs for visual QA
 */
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, isAbsolute, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {optimize} from 'svgo';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const RESEARCH_SIGNS = join(APP, '..', 'research', 'signs');
const CUSTOM = join(APP, 'assets', 'signs-custom');
const SCENES = join(APP, 'assets', 'scenes');
const PHOTOS = join(APP, 'assets', 'photos');
const OUT = join(APP, 'src', 'content', 'signs');
const pngIdx = process.argv.indexOf('--png');
const pngDir = pngIdx > 0 ? resolve(process.argv[pngIdx + 1]) : null;

const CATEGORIES = ['regulatory', 'warning', 'school', 'railroad', 'work_zone', 'guide', 'service', 'recreation', 'signal', 'marking', 'hand_signal', 'hazmat', 'other', 'scenario'];
const CATEGORY_ALIASES = {'work zone': 'work_zone', workzone: 'work_zone', 'temporary traffic control': 'work_zone', services: 'service', hand: 'hand_signal', 'hand signal': 'hand_signal', signals: 'signal', markings: 'marking', 'pavement marking': 'marking'};

function loadManifests() {
  const out = [];
  const add = (file, base) => {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    const list = Array.isArray(data) ? data : data.signs ?? [];
    for (const s of list) {
      out.push({...s, _base: base, _manifest: file});
    }
  };
  if (existsSync(RESEARCH_SIGNS)) {
    for (const f of readdirSync(RESEARCH_SIGNS).filter(n => /^manifest.*\.json$/.test(n)).sort()) {
      add(join(RESEARCH_SIGNS, f), RESEARCH_SIGNS);
    }
  }
  for (const dir of [CUSTOM, SCENES, PHOTOS]) {
    if (existsSync(dir)) {
      for (const f of readdirSync(dir).filter(n => /^manifest.*\.json$/.test(n)).sort()) {
        add(join(dir, f), dir);
      }
    }
  }
  return out;
}

function resolveSvg(entry) {
  if (!entry.svgPath) {
    return null;
  }
  const candidates = isAbsolute(entry.svgPath)
    ? [entry.svgPath]
    : [join(entry._base, entry.svgPath), join(APP, '..', entry.svgPath), join(APP, '..', 'research', entry.svgPath), join(entry._base, 'svg', entry.svgPath)];
  return candidates.find(p => existsSync(p)) ?? null;
}

function optimizeSvg(raw) {
  const result = optimize(raw, {
    multipass: true,
    floatPrecision: 2,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            inlineStyles: {onlyMatchedOnce: false},
            cleanupIds: {minify: true},
          },
        },
      },
      'convertStyleToAttrs',
      'removeDimensions',
      'removeStyleElement',
      'removeScripts',
      {name: 'removeAttrs', params: {attrs: ['data-name', 'class', 'sodipodi:.*', 'inkscape:.*']}},
    ],
  });
  return result.data;
}

function aspectOf(svg) {
  const vb = svg.match(/viewBox="([-\d.\s,e]+)"/);
  if (vb) {
    const [, , w, h] = vb[1].trim().split(/[\s,]+/).map(Number);
    if (w > 0 && h > 0) {
      return Math.round((w / h) * 1000) / 1000;
    }
  }
  return 1;
}

const natural = (a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});

const entries = loadManifests();
const byCode = new Map();
const skipped = [];
for (const e of entries) {
  const code = String(e.code ?? '').trim();
  if (!code) {
    continue;
  }
  const license = String(e.license ?? 'Public domain');
  if (e.file) {
    // Raster photo: openly licensed (PD, CC0, CC BY, CC BY-SA) with attribution shown in the app.
    if (!/^(public domain|cc0|cc by(-sa)? \d(\.\d)?)$/i.test(license.trim()) || !e.author || !e.sourceUrl) {
      skipped.push(`${code}: photo needs license (PD/CC0/CC BY/CC BY-SA), author and sourceUrl`);
      continue;
    }
    const img = join(e._base, e.file);
    if (!existsSync(img) || !(e.width > 0 && e.height > 0)) {
      skipped.push(`${code}: missing photo file or width/height`);
      continue;
    }
    let pcat = String(e.category ?? 'scenario').toLowerCase();
    pcat = CATEGORY_ALIASES[pcat] ?? pcat;
    if (byCode.has(code)) {
      skipped.push(`${code}: duplicate (kept first)`);
      continue;
    }
    byCode.set(code, {
      code,
      name: String(e.name ?? code).trim(),
      category: CATEGORIES.includes(pcat) ? pcat : 'scenario',
      shape: String(e.shape ?? 'Photo').trim(),
      colors: Array.isArray(e.colors) ? e.colors.join(', ') : String(e.colors ?? '').trim(),
      meaning: String(e.meaning ?? '').trim(),
      aspect: Math.round((e.width / e.height) * 1000) / 1000,
      xml: '',
      credit: {author: String(e.author), license, url: String(e.sourceUrl)},
      _image: `../../../assets/photos/${e.file}`, // relative to src/content/signs/index.ts
      _bytes: readFileSync(img).length,
    });
    continue;
  }
  if (!/public domain|pd|cc0|app-drawn|original/i.test(license)) {
    skipped.push(`${code}: license "${license}"`);
    continue;
  }
  const file = resolveSvg(e);
  if (!file) {
    skipped.push(`${code}: no svg`);
    continue;
  }
  let category = String(e.category ?? 'other').toLowerCase();
  category = CATEGORY_ALIASES[category] ?? category;
  if (!CATEGORIES.includes(category)) {
    category = 'other';
  }
  const xml = optimizeSvg(readFileSync(file, 'utf8'));
  if (/<style|<script|<image/i.test(xml)) {
    skipped.push(`${code}: unsupported element after optimize`);
    continue;
  }
  if (byCode.has(code)) {
    skipped.push(`${code}: duplicate (kept first)`);
    continue;
  }
  byCode.set(code, {
    code,
    name: String(e.name ?? code).trim(),
    category,
    shape: String(e.shape ?? '').trim(),
    colors: Array.isArray(e.colors) ? e.colors.join(', ') : String(e.colors ?? '').trim(),
    meaning: String(e.meaning ?? '').trim(),
    aspect: aspectOf(xml),
    xml,
    _hasText: /<text/i.test(xml),
  });
}

const signs = [...byCode.values()].sort(
  (a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || natural(a.code, b.code),
);

mkdirSync(OUT, {recursive: true});
const lines = [
  '/* AUTO-GENERATED by scripts/build-signs.mjs — do not edit by hand.',
  ' * Road-sign artwork: public-domain MUTCD sign SVGs (Wikimedia Commons), app-drawn illustrations and',
  ' * openly licensed photos (credited in-app via `credit`). */',
  "import type {SignInfo} from '../../data/types';",
  '',
  'export const SIGNS: SignInfo[] = [',
];
for (const s of signs) {
  const {_hasText, _image, _bytes, ...rest} = s;
  // Photos are bundled images: append the require() after the JSON (keeps one entry per line).
  const json = JSON.stringify(rest);
  lines.push('  ' + (_image ? `${json.slice(0, -1)}, image: require('${_image}')}` : json) + ',');
}
lines.push('];', '');
writeFileSync(join(OUT, 'index.ts'), lines.join('\n'));
writeFileSync(join(OUT, '_codes.json'), JSON.stringify(signs.map(s => s.code)) + '\n');

if (pngDir) {
  mkdirSync(pngDir, {recursive: true});
  for (const s of signs.filter(x => x.xml)) {
    const svgFile = join(pngDir, `${s.code}.svg`);
    writeFileSync(svgFile, s.xml);
    try {
      execFileSync('rsvg-convert', ['-w', '160', svgFile, '-o', join(pngDir, `${s.code}.png`)]);
    } catch (e) {
      console.log(`render failed: ${s.code}`);
    }
  }
}

const bytes = signs.reduce((n, s) => n + s.xml.length, 0);
const photoBytes = signs.reduce((n, s) => n + (s._bytes ?? 0), 0);
const counts = CATEGORIES.map(c => `${c}=${signs.filter(s => s.category === c).length}`).filter(x => !x.endsWith('=0')).join(' ');
console.log(`${signs.length} signs (${(bytes / 1024).toFixed(0)} KB svg, ${signs.filter(x => x._image).length} photos ${(photoBytes / 1024).toFixed(0)} KB) | ${counts}`);
const withText = signs.filter(s => s._hasText).map(s => s.code);
if (withText.length) {
  console.log(`contain <text> (font-dependent): ${withText.join(', ')}`);
}
if (skipped.length) {
  console.log(`skipped ${skipped.length}:\n  ` + skipped.join('\n  '));
}
