import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState} from 'react-native';
import type {PersistStorage, StateStorage, StorageValue} from 'zustand/middleware';

/**
 * AsyncStorage adapter that coalesces rapid writes (every answered question
 * updates progress) into one write per key per `delayMs`, and flushes
 * immediately when the app goes to the background so nothing is lost.
 */
const pending = new Map<string, string>();
let timer: ReturnType<typeof setTimeout> | null = null;

async function flush(): Promise<void> {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (pending.size === 0) {
    return;
  }
  const entries = Object.fromEntries(pending);
  pending.clear();
  try {
    await AsyncStorage.setMany(entries);
  } catch (e) {
    // Retry once per key; a failed write must not crash the app.
    for (const [k, v] of Object.entries(entries)) {
      try {
        await AsyncStorage.setItem(k, v);
      } catch {
        // give up silently; the next change will try again
      }
    }
  }
}

AppState.addEventListener('change', s => {
  if (s !== 'active') {
    flush();
  }
});

const debounced = (delayMs: number): StateStorage => ({
  getItem: async name => {
    if (pending.has(name)) {
      return pending.get(name) ?? null;
    }
    return AsyncStorage.getItem(name);
  },
  setItem: (name, value) => {
    pending.set(name, value);
    if (!timer) {
      timer = setTimeout(flush, delayMs);
    }
  },
  removeItem: async name => {
    pending.delete(name);
    await AsyncStorage.removeItem(name);
  },
});

/**
 * JSON persistence that never throws on read: unreadable data (corrupted storage, a bad write) is
 * backed up under `<name>.corrupt` and the store starts from defaults instead of the app hanging on
 * the boot screen (zustand never finishes hydration when getItem throws).
 */
function safeJSONStorage<S>(delayMs: number): PersistStorage<S> {
  const raw = debounced(delayMs);
  return {
    getItem: async name => {
      let text: string | null;
      try {
        text = (await raw.getItem(name)) as string | null;
      } catch {
        return null;
      }
      if (text == null) {
        return null;
      }
      try {
        const value = JSON.parse(text) as StorageValue<S>;
        return value && typeof value === 'object' ? value : null;
      } catch {
        try {
          await AsyncStorage.setItem(`${name}.corrupt`, text);
        } catch {
          // nothing more we can do
        }
        return null;
      }
    },
    setItem: (name, value) => raw.setItem(name, JSON.stringify(value)),
    removeItem: name => raw.removeItem(name),
  };
}

export const persistStorage: PersistStorage<unknown> = safeJSONStorage<unknown>(400);

/* ---- hydration failures ------------------------------------------------------------------------
 * If rehydration fails anyway (e.g. a migration throws), zustand never marks the store hydrated.
 * Stores report it here so the boot screen can continue with defaults instead of spinning forever. */
const failed = new Set<string>();
const failureListeners = new Set<() => void>();

export function hydrationFailed(name: string): boolean {
  return failed.has(name);
}

export function onHydrationFailure(cb: () => void): () => void {
  failureListeners.add(cb);
  return () => failureListeners.delete(cb);
}

/** `onRehydrateStorage` for persisted stores (pass the store's state type so zustand can infer it). */
export const rehydrateGuard = <S>(name: string) => (_current: S) => (_state?: S, error?: unknown) => {
  if (error) {
    failed.add(name);
    failureListeners.forEach(cb => cb());
  }
};

/**
 * Default `migrate`: keep persisted data across version bumps. Without a migrate function zustand
 * DISCARDS stored state on a version change, which would wipe every learner's progress.
 * Stores add real migrations here as their shape changes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const keepPersisted = (persisted: unknown): any => persisted;

export const flushStorage = flush;
