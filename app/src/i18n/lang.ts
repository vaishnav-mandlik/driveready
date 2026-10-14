/** Languages the app can show. Content falls back to English wherever a translation is missing or out of date. */
export type Lang = 'en' | 'es';

export const LANGUAGES: {id: Lang; label: string; english: string}[] = [
  {id: 'en', label: 'English', english: 'English'},
  {id: 'es', label: 'Español', english: 'Spanish'},
];

/** BCP-47 tags for text-to-speech and date formatting. */
export const LOCALE: Record<Lang, string> = {en: 'en-US', es: 'es-US'};

/** The device language if the app supports it, otherwise English. */
export function deviceLanguage(): Lang {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return /^es([-_]|$)/i.test(locale) ? 'es' : 'en';
  } catch {
    return 'en';
  }
}
