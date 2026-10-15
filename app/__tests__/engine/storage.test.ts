/**
 * Persisted stores must never strand a user on the boot screen or silently wipe their progress.
 * Each test is a fresh "app launch" (isolated module registry) over a prepared AsyncStorage.
 */
type Storage = {getItem(k: string): Promise<string | null>; setItem(k: string, v: string): Promise<void>};

async function launchWith(entries: Record<string, string>) {
  let result!: {settings: typeof import('../../src/store/settings'); progress: typeof import('../../src/store/progress'); storage: Storage; guards: typeof import('../../src/store/storage')};
  await jest.isolateModulesAsync(async () => {
    const storage = require('@react-native-async-storage/async-storage').default as Storage;
    for (const [k, v] of Object.entries(entries)) {
      await storage.setItem(k, v);
    }
    result = {
      storage,
      settings: require('../../src/store/settings'),
      progress: require('../../src/store/progress'),
      guards: require('../../src/store/storage'),
    };
  });
  // Wait for both stores to finish (or fail) hydration.
  const {settings, progress, guards} = result;
  for (let i = 0; i < 200; i++) {
    const s = settings.useSettings.persist.hasHydrated() || guards.hydrationFailed('settings.v1');
    const p = progress.useProgress.persist.hasHydrated() || guards.hydrationFailed('progress.v1');
    if (s && p) {
      break;
    }
    await new Promise<void>(r => setTimeout(r, 1));
  }
  return result;
}

test('corrupted saved settings: the app starts with defaults and keeps a backup of the bad data', async () => {
  const {settings, storage} = await launchWith({'settings.v1': '{"state": {"state": "TX", trunc'});
  expect(settings.useSettings.persist.hasHydrated()).toBe(true);
  expect(settings.useSettings.getState().onboarded).toBe(false);
  expect(await storage.getItem('settings.v1.corrupt')).toBe('{"state": {"state": "TX", trunc');
});

test('non-object saved data is ignored instead of crashing', async () => {
  const {progress} = await launchWith({'progress.v1': '42'});
  expect(progress.useProgress.persist.hasHydrated()).toBe(true);
  expect(progress.useProgress.getState().stats).toEqual({});
});

test('data saved by an older schema version is kept, not discarded', async () => {
  const saved = JSON.stringify({state: {onboarded: true, state: 'TX', track: 'car', dailyGoal: 35}, version: 0});
  const {settings} = await launchWith({'settings.v1': saved});
  const s = settings.useSettings.getState();
  expect(s.onboarded).toBe(true);
  expect(s.state).toBe('TX');
  expect(s.dailyGoal).toBe(35);
});

test('valid saved data loads normally', async () => {
  const saved = JSON.stringify({state: {onboarded: true, state: 'NY', track: 'motorcycle'}, version: 1});
  const {settings} = await launchWith({'settings.v1': saved});
  expect(settings.useSettings.getState().state).toBe('NY');
  expect(settings.useSettings.getState().track).toBe('motorcycle');
});
