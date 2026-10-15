// Node's crypto is available under Jest; typed locally because the app's tsconfig has no Node types.
const {createHash} = require('crypto') as {createHash: (alg: string) => {update(s: string, enc: string): {digest(enc: string): string}}};
import type {Question} from '../../src/data/types';

jest.mock('../../src/content', () => require('../fixtures/content'));
jest.mock('../../src/config', () => ({...jest.requireActual('../../src/config'), CONTENT_BASE_URL: 'https://cdn.test/v1/'}));

const BASE = 'https://cdn.test/v1';
const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const HOUR = 60 * 60 * 1000;

type Mods = {
  updates: typeof import('../../src/content/updates');
  runtime: typeof import('../../src/content/runtime');
  bank: typeof import('../../src/data/bank');
  states: typeof import('../../src/data/states');
  storage: {getAllKeys(): Promise<string[]>; getMany(k: string[]): Promise<Record<string, string | null>>; setMany(e: Record<string, string>): Promise<void>; getItem(k: string): Promise<string | null>; setItem(k: string, v: string): Promise<void>};
};

/** A fresh module registry = a fresh app process. `carry` copies storage from a previous "launch". */
async function launch(carry?: Mods): Promise<Mods> {
  let m!: Mods;
  jest.isolateModules(() => {
    m = {
      updates: require('../../src/content/updates'),
      runtime: require('../../src/content/runtime'),
      bank: require('../../src/data/bank'),
      states: require('../../src/data/states'),
      storage: require('@react-native-async-storage/async-storage').default,
    };
  });
  if (carry) {
    const keys = await carry.storage.getAllKeys();
    const all = await carry.storage.getMany(keys);
    await m.storage.setMany(Object.fromEntries(Object.entries(all).filter(([, v]) => v !== null)) as Record<string, string>);
  }
  return m;
}

const q = (id: string, extra: Partial<Question> = {}): Question => ({
  id,
  track: 'car',
  topic: 'right-of-way',
  prompt: `Remote question ${id}?`,
  choices: ['Right answer', 'Wrong answer'],
  answer: 0,
  explanation: 'Remote explanation.',
  ...extra,
});

/** Serve a content release: files keyed by path; returns the fetch mock. */
function serve(files: Record<string, unknown>, opts: {contentVersion?: number; minAppVersion?: string; tamper?: string} = {}) {
  const texts = Object.fromEntries(Object.entries(files).map(([p, v]) => [p, JSON.stringify(v)]));
  const manifest = {
    schema: 1,
    contentVersion: opts.contentVersion ?? 202610150000,
    minAppVersion: opts.minAppVersion ?? '1.0.0',
    files: Object.fromEntries(Object.entries(texts).map(([p, t]) => [p, {sha256: sha(t), bytes: t.length}])),
  };
  const byUrl: Record<string, string> = {[`${BASE}/manifest.json`]: JSON.stringify(manifest)};
  for (const [p, t] of Object.entries(texts)) {
    byUrl[`${BASE}/blobs/${sha(t)}.json`] = p === opts.tamper ? t.replace('Right answer', 'Hacked answer') : t;
  }
  const fetchMock = jest.fn(async (url: string) => {
    const body = byUrl[url];
    return {ok: body !== undefined, status: body !== undefined ? 200 : 404, text: async () => body ?? ''};
  });
  (globalThis as unknown as {fetch: unknown}).fetch = fetchMock;
  return fetchMock;
}

describe('sha256 (pure JS)', () => {
  test('matches Node for ASCII, accents, emoji and empty input', () => {
    const {sha256Hex} = require('../../src/content/sha256') as typeof import('../../src/content/sha256');
    for (const s of ['', 'abc', 'Señal de ALTO — ¿qué?', '🚗🚦 0.08%', 'x'.repeat(1000)]) {
      expect(sha256Hex(s)).toBe(sha(s));
    }
  });
});

describe('content updates', () => {
  test('downloads only changed files, installs atomically and applies on the next launch', async () => {
    const first = await launch();
    const fetchMock = serve({'questions/car/new-topic.json': [q('remote.1'), q('remote.2')]});
    expect(await first.updates.checkForContentUpdate({force: true})).toBe('updated');
    // manifest + 1 blob
    expect(fetchMock).toHaveBeenCalledTimes(2);
    // Nothing changes in the running session.
    expect(first.bank.getBank('car', 'CA').byId.has('remote.1')).toBe(false);

    const second = await launch(first);
    await second.updates.applyInstalledContent();
    const bank = second.bank.getBank('car', 'CA');
    expect(bank.byId.get('remote.1')?.prompt).toBe('Remote question remote.1?');
    expect(second.updates.contentStatus()).toEqual({contentVersion: 202610150000, files: 1});
  });

  test('a tampered file fails the hash check and nothing is installed', async () => {
    const m = await launch();
    serve({'questions/car/new-topic.json': [q('remote.1')]}, {tamper: 'questions/car/new-topic.json'});
    expect(await m.updates.checkForContentUpdate({force: true})).toBe('failed');
    expect(await m.storage.getItem('content.v1.installed')).toBeNull();
    expect((await m.storage.getAllKeys()).some(k => k.startsWith('content.v1.blob.'))).toBe(false);
  });

  test('invalid content is rejected even with a correct hash', async () => {
    const m = await launch();
    serve({'questions/car/new-topic.json': [{id: 'x', prompt: 'no choices'}]});
    expect(await m.updates.checkForContentUpdate({force: true})).toBe('failed');
    expect(await m.storage.getItem('content.v1.installed')).toBeNull();
  });

  test('content that needs a newer app is not installed', async () => {
    const m = await launch();
    serve({'questions/car/new-topic.json': [q('remote.1')]}, {minAppVersion: '99.0.0'});
    expect(await m.updates.checkForContentUpdate({force: true})).toBe('app-too-old');
    expect(await m.storage.getItem('content.v1.installed')).toBeNull();
  });

  test('checks at most once every 20 hours, and only downloads when the version is newer', async () => {
    const m = await launch();
    const now = Date.UTC(2026, 9, 15, 12);
    const fetchMock = serve({'questions/car/new-topic.json': [q('remote.1')]});
    expect(await m.updates.checkForContentUpdate({now})).toBe('updated');
    expect(await m.updates.checkForContentUpdate({now: now + 2 * HOUR})).toBe('skipped');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(await m.updates.checkForContentUpdate({now: now + 21 * HOUR})).toBe('up-to-date');
    expect(fetchMock).toHaveBeenCalledTimes(3); // manifest only
  });

  test('a new app build drops updates installed for the previous build', async () => {
    const first = await launch();
    serve({'questions/car/new-topic.json': [q('remote.1')]});
    await first.updates.checkForContentUpdate({force: true});
    const raw = JSON.parse((await first.storage.getItem('content.v1.installed'))!);
    await first.storage.setItem('content.v1.installed', JSON.stringify({...raw, bundleId: 'older-build'}));

    const second = await launch(first);
    await second.updates.applyInstalledContent();
    expect(second.bank.getBank('car', 'CA').byId.has('remote.1')).toBe(false);
    expect(await second.storage.getItem('content.v1.installed')).toBeNull();
  });

  test('questions using images or topics this build lacks are dropped, not shown broken', async () => {
    const first = await launch();
    serve({'questions/car/new-topic.json': [q('remote.ok'), q('remote.sign', {sign: 'NOT-A-SIGN'}), q('remote.topic', {topic: 'future-topic' as never})]});
    await first.updates.checkForContentUpdate({force: true});
    const second = await launch(first);
    await second.updates.applyInstalledContent();
    const ids = second.bank.getBank('car', 'CA').questions.map(x => x.id);
    expect(ids).toContain('remote.ok');
    expect(ids).not.toContain('remote.sign');
    expect(ids).not.toContain('remote.topic');
  });

  test('a new state file arrives through an update', async () => {
    const first = await launch();
    const wy = {code: 'WY', name: 'Wyoming', agency: {name: 'WYDOT', abbreviation: 'WYDOT', website: 'https://example.gov'}, handbook: {title: 'Wyoming Rules of the Road', edition: '2026', url: 'https://example.gov/h.pdf'}, exam: {questions: 25, passingScore: 20, passingPercent: 80, timeLimitMinutes: null, roadSigns: null, format: null, languages: null, retestWait: null, notes: '', sourceUrl: 'https://example.gov'}, motorcycleExam: null, cdlExam: null, facts: [], notableLaws: [], officialPracticeTests: [], verifiedOn: '2026-10-15'};
    serve({'states/WY.json': wy, 'questions/states/WY.json': [q('wy.car.001', {states: ['WY']})]});
    expect(first.states.hasResearchedData('WY')).toBe(false);
    await first.updates.checkForContentUpdate({force: true});
    const second = await launch(first);
    await second.updates.applyInstalledContent();
    expect(second.states.getStateInfo('WY').exam.questions).toBe(25);
    expect(second.bank.getBank('car', 'WY').byId.has('wy.car.001')).toBe(true);
  });

  test('manifest paths and hashes are strictly validated', async () => {
    const {parseManifest} = (await launch()).updates;
    const ok = {schema: 1, contentVersion: 1, minAppVersion: '1.0.0', files: {} as Record<string, unknown>};
    const bad = (path: string, entry: unknown = {sha256: 'a'.repeat(64), bytes: 10}) => () => parseManifest(JSON.stringify({...ok, files: {[path]: entry}}));
    expect(() => parseManifest(JSON.stringify(ok))).not.toThrow();
    expect(bad('questions/car/x.json')).not.toThrow();
    expect(bad('i18n/es/questions/car/x.json')).not.toThrow();
    expect(bad('i18n/es/signs/signs.json')).not.toThrow();
    expect(bad('../../etc/passwd')).toThrow();
    expect(bad('/questions/car/x.json')).toThrow();
    expect(bad('signs/index.ts')).toThrow();
    expect(bad('questions/car/x.js')).toThrow();
    expect(bad('questions/car/x.json', {sha256: 'not-a-hash', bytes: 10})).toThrow();
    expect(bad('questions/car/x.json', {sha256: 'a'.repeat(64), bytes: 50_000_000})).toThrow();
    expect(() => parseManifest(JSON.stringify({...ok, schema: 2}))).toThrow();
  });

  test('version comparison', async () => {
    const {compareVersions} = (await launch()).updates;
    expect(compareVersions('1.10.0', '1.2.9')).toBeGreaterThan(0);
    expect(compareVersions('1.0', '1.0.0')).toBe(0);
    expect(compareVersions('0.9.9', '1.0.0')).toBeLessThan(0);
  });
});
