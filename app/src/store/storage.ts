import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState} from 'react-native';
import {createJSONStorage, StateStorage} from 'zustand/middleware';

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

export const persistStorage = createJSONStorage(() => debounced(400));

export const flushStorage = flush;
