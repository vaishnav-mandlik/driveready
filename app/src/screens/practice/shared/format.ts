import {parseDayKey} from '../../../engine/dates';
import {defineStrings, tr} from '../../../i18n';

const STR = defineStrings(
  {
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    longDate: (weekday: string, month: string, day: number) => `${weekday}, ${month} ${day}`,
    shortDate: (weekday: string, month: string, day: number) => `${weekday}, ${month} ${day}`,
    today: 'Today',
    tomorrow: 'Tomorrow',
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    /** Spanish says "buenas tardes" until dark, so the hour matters there. */
    evening: (_hour: number) => 'Good evening',
  },
  {
    weekdays: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    weekdaysShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    monthsShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    longDate: (weekday: string, month: string, day: number) => `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${day} de ${month}`,
    shortDate: (weekday: string, month: string, day: number) => `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${day} ${month}`,
    today: 'Hoy',
    tomorrow: 'Mañana',
    morning: 'Buenos días',
    afternoon: 'Buenas tardes',
    evening: (hour: number) => (hour >= 17 && hour < 20 ? 'Buenas tardes' : 'Buenas noches'),
  },
);

/** "82%" (or a dash when there is no value yet). */
export function percent(value: number | null | undefined): string {
  return value === null || value === undefined || !Number.isFinite(value) ? '—' : `${Math.round(value * 100)}%`;
}

/** "1,234" — no Intl dependency. */
export function formatCount(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * "1 question" / "12 questions". English-only word handling: for localized text, put a
 * plural function in the caller's `defineStrings` table and use `formatCount` for the number.
 */
export function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return `${formatCount(n)} ${n === 1 ? singular : pluralForm}`;
}

/** "Tuesday, October 13" / "Martes, 13 de octubre" */
export function longDate(date: Date): string {
  const t = tr(STR);
  return t.longDate(t.weekdays[date.getDay()], t.months[date.getMonth()], date.getDate());
}

/** "Tue, Oct 13" / "Mar, 13 oct" */
export function shortDate(date: Date): string {
  const t = tr(STR);
  return t.shortDate(t.weekdaysShort[date.getDay()], t.monthsShort[date.getMonth()], date.getDate());
}

/** "Today", "Tomorrow" or "Wed, Oct 15" for a YYYY-MM-DD key. */
export function relativeDayLabel(key: string, offset: number): string {
  const t = tr(STR);
  if (offset === 0) {
    return t.today;
  }
  if (offset === 1) {
    return t.tomorrow;
  }
  return shortDate(parseDayKey(key));
}

/** Time-of-day greeting. */
export function greeting(hour: number): string {
  const t = tr(STR);
  if (hour >= 5 && hour < 12) {
    return t.morning;
  }
  if (hour >= 12 && hour < 17) {
    return t.afternoon;
  }
  return t.evening(hour);
}
