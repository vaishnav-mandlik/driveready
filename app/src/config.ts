/**
 * App-wide constants.
 *
 * TODO(owner, before publishing):
 *  - APP_NAME / ANDROID_PACKAGE: the owner will choose a different app name. The package id
 *    (android/app/build.gradle applicationId + namespace, Java/Kotlin package folders) can never
 *    change after the first Play upload, so rename it at the same time.
 *  - SUPPORT_EMAIL: owner will create a dedicated support address; replace the placeholder.
 *  - PRIVACY_POLICY_URL: owner will host docs/privacy-policy.html publicly (Play requires a URL).
 */
import {defineStrings, tr} from './i18n';

// TODO(owner): final app name
export const APP_NAME = 'DriveReady';
export const APP_VERSION = '1.0.0';
// TODO(owner): final package id (permanent after first Play upload)
export const ANDROID_PACKAGE = 'com.driveready.app';
// TODO(owner): placeholder — replace with the real support address
export const SUPPORT_EMAIL = 'support@driveready.app';
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
// TODO(owner): placeholder — replace with the public privacy-policy URL
export const PRIVACY_POLICY_URL = 'https://driveready.app/privacy';

const DISCLAIMERS = defineStrings(
  {
    text: 'DriveReady is an independent study app. It is not affiliated with, endorsed by, or connected to any state DMV or other government agency. Always confirm requirements with your state’s official driver handbook and licensing agency.',
  },
  {
    text: 'DriveReady es una app de estudio independiente. No está afiliada, respaldada ni relacionada con ningún DMV estatal ni otra agencia del gobierno. Confirma siempre los requisitos con el manual oficial del conductor y la agencia de licencias de tu estado.',
  },
);

/** The not-a-government-app disclaimer, in the current language. */
export function disclaimer(): string {
  return tr(DISCLAIMERS).text;
}

/** mailto: link for reporting a problem with a question. */
export function reportQuestionUrl(questionId: string, state: string, track: string): string {
  const subject = encodeURIComponent(`Question report: ${questionId}`);
  const body = encodeURIComponent(
    `Question ID: ${questionId}\nState: ${state}\nTest: ${track}\nApp version: ${APP_VERSION}\n\nWhat's wrong with this question?\n`,
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}
