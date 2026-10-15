#!/usr/bin/env node
/**
 * Publishes the app's content (questions, lessons, state facts, translations) as an over-the-air
 * content update to Cloudflare R2 (S3-compatible API). See docs/CONTENT_UPDATES.md.
 *
 *   node scripts/publish-content.mjs --out <dir>            # dry run: write the release to a local folder
 *   node scripts/publish-content.mjs --upload               # validate, upload changed files, then the manifest
 *   node scripts/publish-content.mjs --self-test            # check the request signer against AWS's test vector
 *
 * Options: --min-app <x.y.z> (default: APP_VERSION from src/config.ts), --version <int> (default: UTC YYYYMMDDHHmm).
 * Upload credentials come from the environment only (never commit them):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, and optional CONTENT_PREFIX (e.g. "v1";
 *   the app's CONTENT_BASE_URL must point at https://<your domain>/<CONTENT_PREFIX>).
 * EXCLUDE_STATES / EXCLUDE_FILES work as in build-content-index.mjs (keep unfinished content unpublished).
 *
 * Layout written: <prefix>/blobs/<sha256>.json (immutable, cached for a year) and <prefix>/manifest.json
 * (cached 5 minutes), uploaded LAST so clients never see a manifest pointing at missing files.
 */
import {spawnSync} from 'node:child_process';
import {createHash, createHmac} from 'node:crypto';
import {existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(APP, 'src', 'content');
const SCHEMA = 1;
const args = process.argv.slice(2);
const flag = name => args.includes(name);
const opt = name => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const die = msg => {
  console.error('ERROR ' + msg);
  process.exit(1);
};

const sha256 = data => createHash('sha256').update(data).digest('hex');
const hmac = (key, data) => createHmac('sha256', key).update(data).digest();

// ------------------------------------------------------------------------------------- AWS SigV4 (R2)
/** Signs an S3 request; returns the headers to send (including Authorization). */
export function signS3({method, host, path, region, accessKeyId, secretAccessKey, headers = {}, payloadHash, amzDate}) {
  const date = amzDate.slice(0, 8);
  const all = {...Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), String(v).trim()])), host, 'x-amz-content-sha256': payloadHash, 'x-amz-date': amzDate};
  const names = Object.keys(all).sort();
  const canonicalHeaders = names.map(n => `${n}:${all[n]}\n`).join('');
  const signedHeaders = names.join(';');
  const canonicalUri = path
    .split('/')
    .map(seg => encodeURIComponent(seg).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase()))
    .join('/');
  const canonicalRequest = [method, canonicalUri, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');
  const scope = `${date}/${region}/s3/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest)].join('\n');
  const kSigning = hmac(hmac(hmac(hmac('AWS4' + secretAccessKey, date), region), 's3'), 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  return {...all, authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`};
}

function selfTest() {
  // AWS documentation example: "GET Object" with header-based auth (Signature Version 4).
  const h = signS3({
    method: 'GET',
    host: 'examplebucket.s3.amazonaws.com',
    path: '/test.txt',
    region: 'us-east-1',
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    headers: {range: 'bytes=0-9'},
    payloadHash: sha256(''),
    amzDate: '20130524T000000Z',
  });
  const expected = 'f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41';
  const ok = h.authorization.endsWith(`Signature=${expected}`);
  console.log(ok ? 'signer OK (matches the AWS test vector)' : `signer MISMATCH: ${h.authorization}`);
  process.exit(ok ? 0 : 1);
}

// ------------------------------------------------------------------------------------- release contents
const EXCLUDE_STATES = new Set((process.env.EXCLUDE_STATES ?? '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean));
const EXCLUDE_FILES = new Set((process.env.EXCLUDE_FILES ?? '').split(',').map(s => s.trim()).filter(Boolean));

function walk(dir) {
  return existsSync(dir)
    ? readdirSync(dir)
        .sort()
        .flatMap(n => {
          const p = join(dir, n);
          return statSync(p).isDirectory() ? walk(p) : n.endsWith('.json') && !n.startsWith('_') ? [p] : [];
        })
    : [];
}

/** Same rules as the app's PATH_RE in src/content/updates.ts. */
const BASE_PATH = '(?:questions\\/(?:car|motorcycle|cdl|states)\\/[A-Za-z0-9_.-]+|states\\/[A-Z]{2}|lessons\\/(?:car|motorcycle|cdl)\\/[A-Za-z0-9_.-]+)\\.json';
const PATH_RE = new RegExp(`^(?:${BASE_PATH}|i18n\\/[a-z]{2}\\/(?:${BASE_PATH}|signs\\/[A-Za-z0-9_.-]+\\.json))$`);

function collect() {
  const files = {};
  for (const f of walk(CONTENT)) {
    const path = relative(CONTENT, f).split('\\').join('/');
    if (path.startsWith('signs/')) {
      continue; // sign artwork is code (index.ts), shipped with app releases
    }
    const state = path.match(/(?:^|\/)(?:questions\/states|states)\/([A-Z]{2})\.json$/);
    if ((state && EXCLUDE_STATES.has(state[1])) || EXCLUDE_FILES.has(path.split('/').pop())) {
      continue;
    }
    if (!PATH_RE.test(path)) {
      die(`unexpected content path ${path} (app would reject it)`);
    }
    const buf = readFileSync(f);
    JSON.parse(buf.toString('utf8'));
    files[path] = {buf, sha256: sha256(buf), bytes: buf.length};
  }
  return files;
}

function appVersion() {
  const m = readFileSync(join(APP, 'src', 'config.ts'), 'utf8').match(/APP_VERSION = '([^']+)'/);
  return m ? m[1] : '1.0.0';
}

function utcStamp(d = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return Number(`${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}`);
}

// ------------------------------------------------------------------------------------- R2 client
function r2() {
  const env = name => process.env[name] || die(`missing ${name} (see docs/CONTENT_UPDATES.md)`);
  const accountId = env('R2_ACCOUNT_ID');
  const cfg = {host: `${accountId}.r2.cloudflarestorage.com`, bucket: env('R2_BUCKET'), accessKeyId: env('R2_ACCESS_KEY_ID'), secretAccessKey: env('R2_SECRET_ACCESS_KEY')};
  const prefix = (process.env.CONTENT_PREFIX ?? '').replace(/^\/+|\/+$/g, '');
  const keyOf = k => (prefix ? `${prefix}/${k}` : k);
  async function request(method, key, body, headers = {}) {
    const path = `/${cfg.bucket}/${keyOf(key)}`;
    const amzDate = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const signed = signS3({method, host: cfg.host, path, region: 'auto', accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey, headers, payloadHash: sha256(body ?? ''), amzDate});
    const {host, ...send} = signed;
    return fetch(`https://${cfg.host}${path}`, {method, headers: send, body});
  }
  return {
    async exists(key) {
      const res = await request('HEAD', key);
      return res.status === 200;
    },
    async get(key) {
      const res = await request('GET', key);
      return res.status === 200 ? res.text() : null;
    },
    async put(key, body, cacheControl) {
      for (let attempt = 1; ; attempt++) {
        const res = await request('PUT', key, body, {'content-type': 'application/json; charset=utf-8', 'cache-control': cacheControl});
        if (res.ok) {
          return;
        }
        if (attempt >= 4) {
          die(`upload ${key} failed: HTTP ${res.status} ${await res.text()}`);
        }
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    },
  };
}

// ------------------------------------------------------------------------------------- main
async function main() {
  if (flag('--self-test')) {
    return selfTest();
  }
  const out = opt('--out');
  if (!out && !flag('--upload')) {
    die('use --out <dir> (dry run) or --upload; see the header of this file');
  }
  const v = spawnSync(process.execPath, [join(APP, 'scripts', 'validate-content.mjs'), '--quiet'], {stdio: 'inherit'});
  if (v.status !== 0) {
    die('content has validation errors; nothing published');
  }
  const files = collect();
  const manifest = {
    schema: SCHEMA,
    contentVersion: Number(opt('--version') ?? utcStamp()),
    minAppVersion: opt('--min-app') ?? appVersion(),
    files: Object.fromEntries(Object.entries(files).map(([p, f]) => [p, {sha256: f.sha256, bytes: f.bytes}])),
  };
  const manifestText = JSON.stringify(manifest);
  const total = Object.values(files).reduce((n, f) => n + f.bytes, 0);
  console.log(`release ${manifest.contentVersion}: ${Object.keys(files).length} files, ${(total / 1024).toFixed(0)} KB, minAppVersion ${manifest.minAppVersion}`);

  if (out) {
    mkdirSync(join(out, 'blobs'), {recursive: true});
    for (const f of Object.values(files)) {
      writeFileSync(join(out, 'blobs', `${f.sha256}.json`), f.buf);
    }
    writeFileSync(join(out, 'manifest.json'), manifestText);
    console.log(`wrote ${out}`);
    return;
  }

  const store = r2();
  const previous = await store.get('manifest.json');
  if (previous) {
    const prev = JSON.parse(previous);
    if (manifest.contentVersion <= prev.contentVersion) {
      die(`contentVersion ${manifest.contentVersion} is not newer than the published ${prev.contentVersion}`);
    }
    const changed = Object.keys(files).filter(p => prev.files?.[p]?.sha256 !== files[p].sha256);
    console.log(`changed since ${prev.contentVersion}: ${changed.length ? changed.join(', ') : 'none'}`);
  }
  let uploaded = 0;
  for (const f of Object.values(files)) {
    if (!(await store.exists(`blobs/${f.sha256}.json`))) {
      await store.put(`blobs/${f.sha256}.json`, f.buf, 'public, max-age=31536000, immutable');
      uploaded++;
    }
  }
  await store.put('manifest.json', manifestText, 'public, max-age=300');
  console.log(`published ${manifest.contentVersion}: ${uploaded} new files uploaded, manifest updated`);
}

main().catch(e => die(e.stack || String(e)));
