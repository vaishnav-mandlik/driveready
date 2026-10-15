import {stateInfoLoaders} from '../content';
import {currentLang, defineStrings, tr} from '../i18n';
import {localizeStateInfo} from '../i18n/content';
import type {ExamFormat, StateCode, StateInfo} from './types';

export interface StateListItem {
  code: StateCode;
  name: string;
}

/** All 50 states + DC, alphabetical by name. */
export const STATE_LIST: StateListItem[] = [
  {code: 'AL', name: 'Alabama'},
  {code: 'AK', name: 'Alaska'},
  {code: 'AZ', name: 'Arizona'},
  {code: 'AR', name: 'Arkansas'},
  {code: 'CA', name: 'California'},
  {code: 'CO', name: 'Colorado'},
  {code: 'CT', name: 'Connecticut'},
  {code: 'DE', name: 'Delaware'},
  {code: 'DC', name: 'District of Columbia'},
  {code: 'FL', name: 'Florida'},
  {code: 'GA', name: 'Georgia'},
  {code: 'HI', name: 'Hawaii'},
  {code: 'ID', name: 'Idaho'},
  {code: 'IL', name: 'Illinois'},
  {code: 'IN', name: 'Indiana'},
  {code: 'IA', name: 'Iowa'},
  {code: 'KS', name: 'Kansas'},
  {code: 'KY', name: 'Kentucky'},
  {code: 'LA', name: 'Louisiana'},
  {code: 'ME', name: 'Maine'},
  {code: 'MD', name: 'Maryland'},
  {code: 'MA', name: 'Massachusetts'},
  {code: 'MI', name: 'Michigan'},
  {code: 'MN', name: 'Minnesota'},
  {code: 'MS', name: 'Mississippi'},
  {code: 'MO', name: 'Missouri'},
  {code: 'MT', name: 'Montana'},
  {code: 'NE', name: 'Nebraska'},
  {code: 'NV', name: 'Nevada'},
  {code: 'NH', name: 'New Hampshire'},
  {code: 'NJ', name: 'New Jersey'},
  {code: 'NM', name: 'New Mexico'},
  {code: 'NY', name: 'New York'},
  {code: 'NC', name: 'North Carolina'},
  {code: 'ND', name: 'North Dakota'},
  {code: 'OH', name: 'Ohio'},
  {code: 'OK', name: 'Oklahoma'},
  {code: 'OR', name: 'Oregon'},
  {code: 'PA', name: 'Pennsylvania'},
  {code: 'RI', name: 'Rhode Island'},
  {code: 'SC', name: 'South Carolina'},
  {code: 'SD', name: 'South Dakota'},
  {code: 'TN', name: 'Tennessee'},
  {code: 'TX', name: 'Texas'},
  {code: 'UT', name: 'Utah'},
  {code: 'VT', name: 'Vermont'},
  {code: 'VA', name: 'Virginia'},
  {code: 'WA', name: 'Washington'},
  {code: 'WV', name: 'West Virginia'},
  {code: 'WI', name: 'Wisconsin'},
  {code: 'WY', name: 'Wyoming'},
];

/** Spanish names that differ from the English ones. */
const NAMES_ES: Partial<Record<StateCode, string>> = {
  DC: 'Distrito de Columbia',
  HI: 'Hawái',
  LA: 'Luisiana',
  MS: 'Misisipi',
  NC: 'Carolina del Norte',
  ND: 'Dakota del Norte',
  NJ: 'Nueva Jersey',
  NM: 'Nuevo México',
  NY: 'Nueva York',
  PA: 'Pensilvania',
  SC: 'Carolina del Sur',
  SD: 'Dakota del Sur',
  WV: 'Virginia Occidental',
};

const S = defineStrings(
  {
    yourState: 'Your state',
    fallbackNotes: 'Typical format. Check your state agency for the exact number of questions and passing score.',
    agency: 'Department of Motor Vehicles',
    handbook: 'Driver Handbook',
  },
  {
    yourState: 'Tu estado',
    fallbackNotes: 'Formato típico. Consulta con la agencia de tu estado el número exacto de preguntas y la calificación para aprobar.',
    agency: 'Departamento de Vehículos Motorizados',
    handbook: 'Manual del conductor',
  },
);

const nameByCode = new Map(STATE_LIST.map(s => [s.code, s.name]));

export function stateName(code: StateCode | null | undefined): string {
  if (!code || !nameByCode.has(code)) {
    return tr(S).yourState;
  }
  return (currentLang() === 'es' && NAMES_ES[code]) || nameByCode.get(code)!;
}

/** All states + DC in the current language, alphabetical by displayed name. */
export function stateList(): StateListItem[] {
  if (currentLang() === 'en') {
    return STATE_LIST;
  }
  return STATE_LIST.map(s => ({code: s.code, name: stateName(s.code)})).sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export function isStateCode(v: unknown): v is StateCode {
  return typeof v === 'string' && nameByCode.has(v as StateCode);
}

/** Used only if a state's researched data is missing; flagged in the UI as approximate. */
function fallbackExam(): ExamFormat {
  return {
    questions: 40,
    passingScore: 32,
    passingPercent: 80,
    timeLimitMinutes: null,
    roadSigns: null,
    format: null,
    languages: null,
    retestWait: null,
    notes: tr(S).fallbackNotes,
    sourceUrl: '',
  };
}

const cache = new Map<string, StateInfo>();

export function getStateInfo(code: StateCode): StateInfo {
  const lang = currentLang();
  const key = `${lang}:${code}`;
  const hit = cache.get(key);
  if (hit) {
    return hit;
  }
  const load = stateInfoLoaders[code];
  const info: StateInfo = load
    ? {...localizeStateInfo(load(), lang), name: stateName(code)}
    : {
        code,
        name: stateName(code),
        agency: {name: tr(S).agency, abbreviation: 'DMV', website: ''},
        handbook: {title: tr(S).handbook, edition: '', url: ''},
        exam: fallbackExam(),
        motorcycleExam: null,
        cdlExam: null,
        facts: [],
        notableLaws: [],
        officialPracticeTests: [],
        verifiedOn: '',
      };
  cache.set(key, info);
  return info;
}

/** After a content update is applied. */
export function clearStateCache() {
  cache.clear();
}

export function hasResearchedData(code: StateCode): boolean {
  return !!stateInfoLoaders[code];
}
