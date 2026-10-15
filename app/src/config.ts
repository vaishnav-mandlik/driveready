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
// TODO(owner): set when the Cloudflare R2 bucket + custom domain exist (see docs/CONTENT_UPDATES.md),
// e.g. 'https://content.example.com/v1'. Empty = content updates off: the app never touches the network.
export const CONTENT_BASE_URL = '';

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

const REPORT = defineStrings(
  {
    subject: (id: string) => `Question report: ${id}`,
    body: (id: string, state: string, track: string, version: string) =>
      `Question ID: ${id}\nState: ${state}\nTest: ${track}\nApp version: ${version}\n\nWhat's wrong with this question?\n`,
  },
  {
    subject: (id: string) => `Reporte de pregunta: ${id}`,
    body: (id: string, state: string, track: string, version: string) =>
      `ID de la pregunta: ${id}\nEstado: ${state}\nExamen: ${track}\nVersión de la app: ${version}\n\n¿Qué está mal en esta pregunta?\n`,
  },
);

/** mailto: link for reporting a problem with a question. */
export function reportQuestionUrl(questionId: string, state: string, track: string): string {
  const t = tr(REPORT);
  const subject = encodeURIComponent(t.subject(questionId));
  const body = encodeURIComponent(t.body(questionId, state, track, APP_VERSION));
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}
