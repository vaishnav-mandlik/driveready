/**
 * App-wide constants. Update SUPPORT_EMAIL and PRIVACY_POLICY_URL before
 * publishing (Google Play requires a reachable privacy-policy URL).
 */
export const APP_NAME = 'DriveReady';
export const APP_VERSION = '1.0.0';
export const ANDROID_PACKAGE = 'com.driveready.app';
export const SUPPORT_EMAIL = 'support@driveready.app';
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
export const PRIVACY_POLICY_URL = 'https://driveready.app/privacy';

export const DISCLAIMER =
  'DriveReady is an independent study app. It is not affiliated with, endorsed by, or connected to any state DMV or other government agency. Always confirm requirements with your state’s official driver handbook and licensing agency.';

/** mailto: link for reporting a problem with a question. */
export function reportQuestionUrl(questionId: string, state: string, track: string): string {
  const subject = encodeURIComponent(`Question report: ${questionId}`);
  const body = encodeURIComponent(
    `Question ID: ${questionId}\nState: ${state}\nTest: ${track}\nApp version: ${APP_VERSION}\n\nWhat's wrong with this question?\n`,
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}
