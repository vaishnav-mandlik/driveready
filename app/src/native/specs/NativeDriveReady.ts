import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

/** App-level Turbo Native Module (Android: DriveReadyModule.java). */
export interface Spec extends TurboModule {
  /** `language` is a BCP-47 tag such as "en-US" or "es-US". */
  speak(text: string, rate: number, language: string): void;
  stopSpeaking(): void;
  isSpeechAvailable(): Promise<boolean>;
  haptic(kind: string): void;
  scheduleDailyReminder(hour: number, minute: number, title: string, body: string): Promise<boolean>;
  cancelDailyReminder(): void;
}

// `get` (not `getEnforcing`) so JS keeps working where the native side is
// absent (Jest, or iOS before its implementation lands).
export default TurboModuleRegistry.get<Spec>('DriveReady');
