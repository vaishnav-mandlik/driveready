/**
 * Over-the-air content updates (questions, lessons, state facts, translations) from a static CDN
 * (Cloudflare R2; see docs/CONTENT_UPDATES.md). Design goals, in order:
 *
 *  1. Never break the app: bundled content is always the fallback; an update is installed only when
 *     every file downloaded, matched its SHA-256 and passed shape checks; nothing changes mid-session
 *     (installed updates apply on the next launch).
 *  2. Stay instant and offline: startup reads at most the changed files from local storage; the network
 *     check runs after the first screen, at most once every 20 hours, and only downloads changed files.
 *  3. No personal data: plain GETs of public files, no identifiers.
 *
 * Remote layout (written by scripts/publish-content.mjs):
 *   <base>/manifest.json            {schema, contentVersion, minAppVersion, files: {path: {sha256, bytes}}}
 *   <base>/blobs/<sha256>.json      file contents, immutable (content-addressed)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {APP_VERSION, CONTENT_BASE_URL} from '../config';
import {clearBankCache} from '../data/bank';
import {clearLessonCache} from '../data/lessons';
import {clearSignCache, getSign} from '../data/signs';
import {clearStateCache, isStateCode} from '../data/states';
import {getTopic} from '../data/tracks';
import type {Question, StateCode, TopicId, TrackId, TranslationLoaders} from '../data/types';
import {LANGUAGES, type Lang} from '../i18n/lang';
import {bundledHashes, lessonLoaders, stateInfoLoaders, stateQuestionLoaders, translationLoaders, universalQuestionLoaders} from './index';
import {remote, setOverrides} from './runtime';
import {sha256Hex} from './sha256';

export const SCHEMA = 1;
const K_INSTALLED = 'content.v1.installed';
const K_LAST_CHECK = 'content.v1.lastCheck';
const BLOB_PREFIX = 'content.v1.blob.';
const CHECK_EVERY_MS = 20 * 60 * 60 * 1000;
const LIMITS = {manifestBytes: 1_000_000, fileBytes: 2_000_000, totalBytes: 25_000_000, files: 1000, timeoutMs: 15_000, parallel: 4};

const TRACK_DIR = '(car|motorcycle|cdl)';
const BASE_PATH = `(?:questions\\/(?:${TRACK_DIR.slice(1, -1)}|states)\\/[A-Za-z0-9_.-]+|states\\/[A-Z]{2}|lessons\\/${TRACK_DIR}\\/[A-Za-z0-9_.-]+)\\.json`;
const PATH_RE = new RegExp(`^(?:${BASE_PATH}|i18n\\/[a-z]{2}\\/(?:${BASE_PATH}|signs\\/[A-Za-z0-9_.-]+\\.json))$`);
const SHA_RE = /^[0-9a-f]{64}$/;

export interface RemoteManifest {
  schema: number;
  contentVersion: number;
  minAppVersion: string;
  files: Record<string, {sha256: string; bytes: number}>;
}

/** What is installed on this device (only files that differ from the bundled copy). */
interface Installed {
  contentVersion: number;
  /** Fingerprint of the bundled content when this was installed: a new app build invalidates old updates. */
  bundleId: string;
  files: Record<string, string>;
}

export type CheckResult = 'disabled' | 'skipped' | 'up-to-date' | 'app-too-old' | 'updated' | 'failed';

let bundleIdCache: string | null = null;
/** Stable fingerprint of everything bundled in this build. */
export function bundleId(): string {
  bundleIdCache ??= sha256Hex(
    Object.keys(bundledHashes)
      .sort()
      .map(k => `${k}:${bundledHashes[k]}`)
      .join('\n'),
  ).slice(0, 16);
  return bundleIdCache;
}

/** "1.2.10" vs "1.10.0" → negative / 0 / positive. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(n => parseInt(n, 10) || 0);
  const pb = b.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) {
      return d;
    }
  }
  return 0;
}

// ---------------------------------------------------------------------------------------------- validation

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

function validQuestion(q: unknown): q is Question {
  if (!isObj(q) || !isStr(q.id) || !isStr(q.prompt) || !isStr(q.explanation) || !isStr(q.topic)) {
    return false;
  }
  if (!['car', 'motorcycle', 'cdl'].includes(q.track as string) || !Array.isArray(q.choices)) {
    return false;
  }
  const choices = q.choices as unknown[];
  return choices.length >= 2 && choices.length <= 6 && choices.every(isStr) && Number.isInteger(q.answer) && (q.answer as number) >= 0 && (q.answer as number) < choices.length;
}

/** Structural check of a downloaded file before it is accepted (throws on anything unexpected). */
export function validateFile(path: string, data: unknown): void {
  const p = path.replace(/^i18n\/[a-z]{2}\//, '');
  const translated = path.startsWith('i18n/');
  const fail = (why: string) => {
    throw new Error(`${path}: ${why}`);
  };
  if (translated) {
    if (!isObj(data)) {
      fail('translation must be an object');
    }
    return;
  }
  if (p.startsWith('questions/')) {
    if (!Array.isArray(data) || !data.every(validQuestion)) {
      fail('invalid question list');
    }
    return;
  }
  if (p.startsWith('states/')) {
    const s = data as Record<string, unknown>;
    const exam = isObj(s) ? (s.exam as Record<string, unknown>) : null;
    if (!isObj(s) || s.code !== p.slice(7, 9) || !isStr(s.name) || !isObj(exam) || !Number.isInteger(exam.questions) || !Number.isInteger(exam.passingScore) || !Array.isArray(s.facts) || !Array.isArray(s.notableLaws)) {
      fail('invalid state info');
    }
    return;
  }
  if (p.startsWith('lessons/')) {
    const l = data as Record<string, unknown>;
    if (!isObj(l) || !isStr(l.id) || !isStr(l.title) || !Array.isArray(l.sections) || !Array.isArray(l.keyPoints)) {
      fail('invalid lesson');
    }
    return;
  }
  fail('unknown content type');
}

/**
 * Forward compatibility: content published for a newer app may reference sign images or topics this
 * build does not have. Such questions are dropped instead of showing a broken picture.
 */
export function sanitize(path: string, data: unknown): unknown {
  if (path.startsWith('questions/') && Array.isArray(data)) {
    return (data as Question[]).filter(q => (!q.sign || !!getSign(q.sign)) && !!getTopic(q.topic as TopicId));
  }
  return data;
}

// ---------------------------------------------------------------------------------------------- startup

const emptyTranslations = (): TranslationLoaders => ({universal: {car: [], motorcycle: [], cdl: []}, states: {}, stateInfo: {}, lessons: [], signs: []});

/** Make a file that exists only as an update (e.g. a new state or topic file) visible to the loaders. */
function registerRemoteOnly(path: string) {
  const get = () => remote<never>(path);
  let m: RegExpMatchArray | null;
  const i18n = path.match(/^i18n\/([a-z]{2})\/(.+)$/);
  if (i18n) {
    const lang = i18n[1] as Lang;
    if (!LANGUAGES.some(l => l.id === lang)) {
      return;
    }
    const t = (translationLoaders[lang] ??= emptyTranslations());
    const rest = i18n[2];
    if ((m = rest.match(/^questions\/(car|motorcycle|cdl)\//))) {
      t.universal[m[1] as TrackId].push(get);
    } else if ((m = rest.match(/^questions\/states\/([A-Z]{2})\.json$/)) && isStateCode(m[1])) {
      t.states[m[1] as StateCode] = get;
    } else if ((m = rest.match(/^states\/([A-Z]{2})\.json$/)) && isStateCode(m[1])) {
      t.stateInfo[m[1] as StateCode] = get;
    } else if (rest.startsWith('lessons/')) {
      t.lessons.push(get);
    } else if (rest.startsWith('signs/')) {
      t.signs.push(get);
    }
    return;
  }
  if ((m = path.match(/^questions\/(car|motorcycle|cdl)\//))) {
    universalQuestionLoaders[m[1] as TrackId].push(get);
  } else if ((m = path.match(/^questions\/states\/([A-Z]{2})\.json$/)) && isStateCode(m[1])) {
    stateQuestionLoaders[m[1] as StateCode] = get;
  } else if ((m = path.match(/^states\/([A-Z]{2})\.json$/)) && isStateCode(m[1])) {
    stateInfoLoaders[m[1] as StateCode] = get;
  } else if (path.startsWith('lessons/')) {
    lessonLoaders.push(get);
  }
}

function clearContentCaches() {
  clearBankCache();
  clearLessonCache();
  clearStateCache();
  clearSignCache();
}

let status: {contentVersion: number | null; files: number} = {contentVersion: null, files: 0};

/** Content version in use (null = the content bundled with the app). */
export function contentStatus() {
  return status;
}

async function readInstalled(): Promise<Installed | null> {
  try {
    const raw = await AsyncStorage.getItem(K_INSTALLED);
    const v = raw ? (JSON.parse(raw) as Installed) : null;
    return v && Number.isInteger(v.contentVersion) && isObj(v.files) && typeof v.bundleId === 'string' ? v : null;
  } catch {
    return null;
  }
}

async function dropInstalled() {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter(k => k === K_INSTALLED || k === K_LAST_CHECK || k.startsWith(BLOB_PREFIX));
    if (keys.length) {
      await AsyncStorage.removeMany(keys);
    }
  } catch {
    // best effort
  }
}

/**
 * Called once at startup, before the first screen renders: applies the installed update (if any).
 * Never throws; on any problem the app simply uses its bundled content.
 */
export async function applyInstalledContent(): Promise<void> {
  const installed = await readInstalled();
  if (!installed) {
    return;
  }
  if (installed.bundleId !== bundleId()) {
    // The app was updated and ships newer content; the next check re-downloads anything newer still.
    await dropInstalled();
    return;
  }
  try {
    const paths = Object.keys(installed.files).filter(p => PATH_RE.test(p));
    const blobs = paths.length ? await AsyncStorage.getMany(paths.map(p => BLOB_PREFIX + installed.files[p])) : {};
    const map = new Map<string, unknown>();
    for (const p of paths) {
      const raw = blobs[BLOB_PREFIX + installed.files[p]];
      if (!raw) {
        throw new Error(`missing ${p}`);
      }
      const data = JSON.parse(raw);
      validateFile(p, data);
      map.set(p, data);
    }
    // Sanitizing needs the sign registry, so it runs after the raw files are known to be good.
    for (const [p, data] of map) {
      map.set(p, sanitize(p, data));
    }
    setOverrides(map);
    for (const p of paths) {
      if (!(p in bundledHashes)) {
        registerRemoteOnly(p);
      }
    }
    clearContentCaches();
    status = {contentVersion: installed.contentVersion, files: paths.length};
  } catch {
    setOverrides(new Map());
    clearContentCaches();
    await dropInstalled();
  }
}

// ---------------------------------------------------------------------------------------------- network

async function fetchText(url: string, maxBytes: number): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LIMITS.timeoutMs);
  try {
    const res = await fetch(url, {signal: controller.signal, headers: {'Cache-Control': 'no-cache'}});
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }
    const text = await res.text();
    if (text.length > maxBytes) {
      throw new Error(`${url} too large`);
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}

export function parseManifest(text: string): RemoteManifest {
  const m = JSON.parse(text) as RemoteManifest;
  if (!isObj(m) || m.schema !== SCHEMA || !Number.isInteger(m.contentVersion) || !isStr(m.minAppVersion) || !isObj(m.files)) {
    throw new Error('bad manifest');
  }
  const entries = Object.entries(m.files);
  if (entries.length > LIMITS.files) {
    throw new Error('too many files');
  }
  for (const [path, f] of entries) {
    if (!PATH_RE.test(path) || !isObj(f) || !SHA_RE.test(f.sha256) || !Number.isInteger(f.bytes) || f.bytes < 0 || f.bytes > LIMITS.fileBytes) {
      throw new Error(`bad manifest entry ${path}`);
    }
  }
  return m;
}

let inFlight: Promise<CheckResult> | null = null;

/**
 * Checks the CDN for newer content and installs it for the next launch.
 * Safe to call often: it runs at most once per 20 hours (unless forced) and never throws.
 */
export function checkForContentUpdate(opts: {force?: boolean; now?: number} = {}): Promise<CheckResult> {
  inFlight ??= runCheck(opts).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function runCheck({force = false, now = Date.now()}: {force?: boolean; now?: number}): Promise<CheckResult> {
  const base = CONTENT_BASE_URL.replace(/\/+$/, '');
  if (!/^https:\/\//.test(base)) {
    return 'disabled';
  }
  try {
    if (!force) {
      const last = Number(await AsyncStorage.getItem(K_LAST_CHECK));
      if (last && now - last < CHECK_EVERY_MS && now >= last) {
        return 'skipped';
      }
    }
    const manifest = parseManifest(await fetchText(`${base}/manifest.json`, LIMITS.manifestBytes));
    await AsyncStorage.setItem(K_LAST_CHECK, String(now));
    if (compareVersions(APP_VERSION, manifest.minAppVersion) < 0) {
      return 'app-too-old';
    }
    const installed = await readInstalled();
    const current = installed && installed.bundleId === bundleId() ? installed : null;
    if (current && manifest.contentVersion <= current.contentVersion) {
      return 'up-to-date';
    }
    // Files that differ from what this build bundles; only those are stored.
    const wanted: Record<string, string> = {};
    for (const [path, f] of Object.entries(manifest.files)) {
      if (bundledHashes[path] !== f.sha256) {
        wanted[path] = f.sha256;
      }
    }
    const haveKeys = new Set(await AsyncStorage.getAllKeys());
    const toFetch = [...new Set(Object.values(wanted))].filter(sha => !haveKeys.has(BLOB_PREFIX + sha));
    const total = toFetch.reduce((n, sha) => n + (Object.values(manifest.files).find(f => f.sha256 === sha)?.bytes ?? 0), 0);
    if (total > LIMITS.totalBytes) {
      throw new Error('update too large');
    }
    const pathOf = new Map(Object.entries(wanted).map(([p, sha]) => [sha, p]));
    const downloaded: Record<string, string> = {};
    for (let i = 0; i < toFetch.length; i += LIMITS.parallel) {
      await Promise.all(
        toFetch.slice(i, i + LIMITS.parallel).map(async sha => {
          const text = await fetchText(`${base}/blobs/${sha}.json`, LIMITS.fileBytes);
          if (sha256Hex(text) !== sha) {
            throw new Error(`hash mismatch for ${pathOf.get(sha)}`);
          }
          validateFile(pathOf.get(sha)!, JSON.parse(text));
          downloaded[BLOB_PREFIX + sha] = text;
        }),
      );
    }
    if (Object.keys(downloaded).length) {
      await AsyncStorage.setMany(downloaded);
    }
    // Commit point: one write switches the installed set (applied on next launch).
    const next: Installed = {contentVersion: manifest.contentVersion, bundleId: bundleId(), files: wanted};
    await AsyncStorage.setItem(K_INSTALLED, JSON.stringify(next));
    // Garbage-collect blobs the new set no longer uses.
    const keep = new Set(Object.values(wanted).map(sha => BLOB_PREFIX + sha));
    const stale = (await AsyncStorage.getAllKeys()).filter(k => k.startsWith(BLOB_PREFIX) && !keep.has(k));
    if (stale.length) {
      await AsyncStorage.removeMany(stale);
    }
    return 'updated';
  } catch {
    return 'failed';
  }
}
