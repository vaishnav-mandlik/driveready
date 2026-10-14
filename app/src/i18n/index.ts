import {getSettings, useSettings} from '../store/settings';
import {LOCALE, type Lang} from './lang';

export * from './lang';

/** A UI string table: one entry per language, with identical keys. */
export type Strings<T> = Record<Lang, T>;

/**
 * Declares the UI strings of one screen or module. `es` must have exactly the keys (and
 * function signatures) of `en`, so a missing translation is a compile error.
 * Use functions for text with values: `count: (n: number) => `${n} questions``.
 */
export function defineStrings<T extends object>(en: T, es: NoInfer<T>): Strings<T> {
  return {en, es};
}

/**
 * Current language (non-reactive). The navigation tree remounts when the language changes,
 * so reading it while rendering is safe. Never call it at module scope.
 */
export function currentLang(): Lang {
  return getSettings().language;
}

/** The strings of `table` in the current language (reactive). */
export function useStrings<T>(table: Strings<T>): T {
  const lang = useSettings(s => s.language);
  return table[lang] ?? table.en;
}

/** Non-hook variant for data modules, engine code and event handlers. */
export function tr<T>(table: Strings<T>): T {
  return table[currentLang()] ?? table.en;
}

/** Locale tag for dates and speech in the current language. */
export function currentLocale(): string {
  return LOCALE[currentLang()];
}

/** Short date in the current language, e.g. "Oct 14, 2026" / "14 oct 2026". */
export function formatDate(at: number | Date): string {
  try {
    return new Date(at).toLocaleDateString(currentLocale(), {month: 'short', day: 'numeric', year: 'numeric'});
  } catch {
    return new Date(at).toDateString();
  }
}

/** Date and time in the current language. */
export function formatDateTime(at: number | Date): string {
  try {
    return new Date(at).toLocaleString(currentLocale(), {month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'});
  } catch {
    return new Date(at).toString();
  }
}
