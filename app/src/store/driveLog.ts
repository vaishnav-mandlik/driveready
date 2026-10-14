import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {StateFact} from '../data/types';
import {defineStrings, tr} from '../i18n';
import {persistStorage} from './storage';

/** One supervised practice drive logged by a permit holder. */
export interface DriveEntry {
  id: string;
  /** YYYY-MM-DD (local) */
  date: string;
  /** Total minutes driven. */
  minutes: number;
  /** Minutes of the total that were driven at night. */
  nightMinutes: number;
  /** Tags such as "highway", "rain", "parking". */
  conditions: string[];
  /** Supervising driver's name or initials. */
  supervisor: string;
  notes: string;
  createdAt: number;
}

export const DRIVE_CONDITIONS = [
  'Residential',
  'City traffic',
  'Highway',
  'Rural road',
  'Parking',
  'Rain',
  'Snow/ice',
  'Fog',
  'Heavy traffic',
  'Night',
] as const;

const STR = defineStrings(
  {
    conditions: {} as Record<string, string>,
    csvHeader: ['Date', 'Minutes', 'Night minutes', 'Conditions', 'Supervisor', 'Notes'],
  },
  {
    conditions: {
      Residential: 'Residencial',
      'City traffic': 'Tráfico urbano',
      Highway: 'Autopista',
      'Rural road': 'Camino rural',
      Parking: 'Estacionamiento',
      Rain: 'Lluvia',
      'Snow/ice': 'Nieve/hielo',
      Fog: 'Niebla',
      'Heavy traffic': 'Mucho tráfico',
      Night: 'Noche',
    } as Record<string, string>,
    csvHeader: ['Fecha', 'Minutos', 'Minutos de noche', 'Condiciones', 'Supervisor', 'Notas'],
  },
);

/**
 * Display label of a drive condition. Entries store the English id (DRIVE_CONDITIONS),
 * so saved logs keep working when the language changes.
 */
export function driveConditionLabel(condition: string): string {
  return tr(STR).conditions[condition] ?? condition;
}

interface DriveLogState {
  entries: DriveEntry[];
  /** User override of required hours (null = use the state's verified requirement). */
  requiredHours: number | null;
  requiredNightHours: number | null;
  add: (e: Omit<DriveEntry, 'id' | 'createdAt'>) => void;
  update: (id: string, patch: Partial<Omit<DriveEntry, 'id' | 'createdAt'>>) => void;
  remove: (id: string) => void;
  setRequirement: (hours: number | null, nightHours: number | null) => void;
  resetLog: () => void;
}

export const useDriveLog = create<DriveLogState>()(
  persist(
    set => ({
      entries: [],
      requiredHours: null,
      requiredNightHours: null,
      add: e =>
        set(s => ({
          entries: [{...e, id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, createdAt: Date.now()}, ...s.entries].sort(
            (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt),
          ),
        })),
      update: (id, patch) => set(s => ({entries: s.entries.map(x => (x.id === id ? {...x, ...patch} : x))})),
      remove: id => set(s => ({entries: s.entries.filter(x => x.id !== id)})),
      setRequirement: (requiredHours, requiredNightHours) => set({requiredHours, requiredNightHours}),
      resetLog: () => set({entries: [], requiredHours: null, requiredNightHours: null}),
    }),
    {
      name: 'drivelog.v1',
      storage: persistStorage,
      version: 1,
      partialize: s => ({entries: s.entries, requiredHours: s.requiredHours, requiredNightHours: s.requiredNightHours}),
    },
  ),
);

export interface DriveTotals {
  minutes: number;
  nightMinutes: number;
  drives: number;
}

export function driveTotals(entries: DriveEntry[]): DriveTotals {
  return entries.reduce<DriveTotals>(
    (t, e) => ({minutes: t.minutes + e.minutes, nightMinutes: t.nightMinutes + e.nightMinutes, drives: t.drives + 1}),
    {minutes: 0, nightMinutes: 0, drives: 0},
  );
}

/**
 * Reads the state's required supervised hours from its verified fact
 * (e.g. value "50 hours (10 at night)"). Returns nulls when unknown.
 */
export function requirementFromFact(fact: StateFact | undefined): {hours: number | null; nightHours: number | null} {
  if (!fact) {
    return {hours: null, nightHours: null};
  }
  const text = `${fact.value} ${fact.detail}`;
  const hours = fact.number ?? (Number(text.match(/(\d{1,3})\s*(?:hours?|horas?)/i)?.[1]) || null);
  // English, then Spanish wording (state facts are shown translated when the app is in Spanish).
  const night =
    text.match(/(\d{1,3})\s*(?:hours?\s*)?(?:of\s+which\s+)?(?:must\s+be\s+)?(?:at|during)\s+night/i) ??
    text.match(/(\d{1,3})\s*(?:hours?\s*)?night/i) ??
    text.match(/(\d{1,3})\s*(?:horas?\s*)?(?:(?:de|durante\s+la|por\s+la|en\s+la)\s+noche|nocturnas?)/i);
  return {hours: hours && hours > 0 ? hours : null, nightHours: night ? Number(night[1]) : null};
}

/** CSV export of the log (for sharing with a parent/DMV), with headers in the current language. */
export function driveLogCsv(entries: DriveEntry[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [tr(STR).csvHeader.join(',')];
  for (const e of entries) {
    rows.push([e.date, String(e.minutes), String(e.nightMinutes), esc(e.conditions.map(driveConditionLabel).join('; ')), esc(e.supervisor), esc(e.notes)].join(','));
  }
  return rows.join('\n');
}
