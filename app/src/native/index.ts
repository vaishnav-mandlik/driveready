import {PermissionsAndroid, Platform} from 'react-native';
import Native from './specs/NativeDriveReady';
import {getSettings} from '../store/settings';

export type HapticKind = 'tap' | 'selection' | 'success' | 'error' | 'heavy';

/** Light haptic feedback; respects the in-app Haptics setting. */
export function haptic(kind: HapticKind = 'tap') {
  if (!getSettings().haptics) {
    return;
  }
  try {
    Native?.haptic(kind);
  } catch {
    // haptics are best-effort
  }
}

export const speech = {
  speak(text: string) {
    Native?.speak(text, getSettings().speechRate);
  },
  stop() {
    Native?.stopSpeaking();
  },
  async available(): Promise<boolean> {
    try {
      return (await Native?.isSpeechAvailable()) ?? false;
    } catch {
      return false;
    }
  },
};

/** Ask for notification permission on Android 13+; true if we may post notifications. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }
  if (typeof Platform.Version === 'number' && Platform.Version < 33) {
    return true;
  }
  const perm = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
  if (await PermissionsAndroid.check(perm)) {
    return true;
  }
  const result = await PermissionsAndroid.request(perm);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export const reminders = {
  isSupported: Platform.OS === 'android' && !!Native,
  async schedule(hour: number, minute: number, title: string, body: string): Promise<boolean> {
    if (!Native) {
      return false;
    }
    const allowed = await ensureNotificationPermission();
    if (!allowed) {
      return false;
    }
    return Native.scheduleDailyReminder(hour, minute, title, body);
  },
  cancel() {
    Native?.cancelDailyReminder();
  },
};
