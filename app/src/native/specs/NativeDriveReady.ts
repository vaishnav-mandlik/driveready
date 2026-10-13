import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

/** App-level Turbo Native Module (Android: DriveReadyModule.java). */
export interface Spec extends TurboModule {
  speak(text: string, rate: number): void;
  stopSpeaking(): void;
  isSpeechAvailable(): Promise<boolean>;
  haptic(kind: string): void;
  scheduleDailyReminder(hour: number, minute: number, title: string, body: string): Promise<boolean>;
  cancelDailyReminder(): void;
}

// `get` (not `getEnforcing`) so JS keeps working where the native side is
// absent (Jest, or iOS before its implementation lands).
export default TurboModuleRegistry.get<Spec>('DriveReady');
