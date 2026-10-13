const DAY_MS = 24 * 60 * 60 * 1000;

/** Local calendar day key, e.g. "2026-10-13". */
export function dayKey(time: number | Date = Date.now()): string {
  const d = typeof time === 'number' ? new Date(time) : time;
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${d.getFullYear()}-${m < 10 ? '0' : ''}${m}-${day < 10 ? '0' : ''}${day}`;
}

/** Parse a YYYY-MM-DD key as local midnight. */
export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Whole calendar days from today until `key` (negative if past). */
export function daysUntil(key: string, now: number = Date.now()): number {
  const today = parseDayKey(dayKey(now)).getTime();
  return Math.round((parseDayKey(key).getTime() - today) / DAY_MS);
}

/** Keys for the last `n` days ending today, oldest first. */
export function lastNDays(n: number, now: number = Date.now()): string[] {
  const today = parseDayKey(dayKey(now));
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(dayKey(addDays(today, -i)));
  }
  return out;
}

/**
 * Consecutive active days ending today (or yesterday, so the streak survives
 * until the learner has had a chance to study today).
 */
export function currentStreak(activeDays: Record<string, unknown>, now: number = Date.now()): number {
  let cursor = parseDayKey(dayKey(now));
  if (!activeDays[dayKey(cursor)]) {
    cursor = addDays(cursor, -1);
  }
  let streak = 0;
  while (activeDays[dayKey(cursor)]) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(activeDays: Record<string, unknown>): number {
  const keys = Object.keys(activeDays).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of keys) {
    const d = parseDayKey(k);
    run = prev && Math.round((d.getTime() - prev.getTime()) / DAY_MS) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  if (m > 0) {
    return `${m}m`;
  }
  return `${s}s`;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

export const DAY = DAY_MS;
