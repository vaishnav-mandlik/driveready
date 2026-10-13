import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {StateCode, TrackId} from '../data/types';
import {persistStorage} from './storage';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export interface SettingsState {
  onboarded: boolean;
  state: StateCode | null;
  track: TrackId;
  /** Display name used in greetings (optional). */
  name: string;
  theme: ThemeMode;
  /** 1 = default, 1.15 = large, 1.3 = extra large. */
  textScale: number;
  haptics: boolean;
  /** Exam simulator: show a countdown when the state test is timed. */
  examTimer: boolean;
  /** Exam simulator: stop as soon as pass/fail is decided, like many real DMV tests. */
  realisticExam: boolean;
  shuffleChoices: boolean;
  /** Practice: move to the next question automatically after a correct answer. */
  autoAdvance: boolean;
  /** Questions per day the learner aims for. */
  dailyGoal: number;
  /** Planned test date, YYYY-MM-DD. */
  examDate: string | null;
  reminder: ReminderSettings;
  /** Read-aloud speech rate (0.5–1.5). */
  speechRate: number;

  update: (patch: Partial<Omit<SettingsState, 'update' | 'completeOnboarding' | 'resetSettings'>>) => void;
  completeOnboarding: () => void;
  resetSettings: () => void;
}

const defaults = {
  onboarded: false,
  state: null,
  track: 'car' as TrackId,
  name: '',
  theme: 'system' as ThemeMode,
  textScale: 1,
  haptics: true,
  examTimer: true,
  realisticExam: false,
  shuffleChoices: true,
  autoAdvance: false,
  dailyGoal: 20,
  examDate: null,
  reminder: {enabled: false, hour: 19, minute: 0},
  speechRate: 1,
};

export const useSettings = create<SettingsState>()(
  persist(
    set => ({
      ...defaults,
      update: patch => set(patch),
      completeOnboarding: () => set({onboarded: true}),
      resetSettings: () => set({...defaults}),
    }),
    {
      name: 'settings.v1',
      storage: persistStorage,
      version: 1,
      partialize: ({update, completeOnboarding, resetSettings, ...rest}) => rest,
    },
  ),
);

/** Non-reactive read for engine code and event handlers. */
export const getSettings = () => useSettings.getState();
