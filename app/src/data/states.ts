import {stateInfoLoaders} from '../content';
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

const nameByCode = new Map(STATE_LIST.map(s => [s.code, s.name]));

export function stateName(code: StateCode | null | undefined): string {
  return (code && nameByCode.get(code)) || 'Your state';
}

export function isStateCode(v: unknown): v is StateCode {
  return typeof v === 'string' && nameByCode.has(v as StateCode);
}

/** Used only if a state's researched data is missing; flagged in the UI as approximate. */
const FALLBACK_EXAM: ExamFormat = {
  questions: 40,
  passingScore: 32,
  passingPercent: 80,
  timeLimitMinutes: null,
  roadSigns: null,
  format: null,
  languages: null,
  retestWait: null,
  notes: 'Typical format. Check your state agency for the exact number of questions and passing score.',
  sourceUrl: '',
};

const cache = new Map<StateCode, StateInfo>();

export function getStateInfo(code: StateCode): StateInfo {
  const hit = cache.get(code);
  if (hit) {
    return hit;
  }
  const load = stateInfoLoaders[code];
  const info: StateInfo = load
    ? load()
    : {
        code,
        name: stateName(code),
        agency: {name: 'Department of Motor Vehicles', abbreviation: 'DMV', website: ''},
        handbook: {title: 'Driver Handbook', edition: '', url: ''},
        exam: FALLBACK_EXAM,
        motorcycleExam: null,
        cdlExam: null,
        facts: [],
        notableLaws: [],
        officialPracticeTests: [],
        verifiedOn: '',
      };
  cache.set(code, info);
  return info;
}

export function hasResearchedData(code: StateCode): boolean {
  return !!stateInfoLoaders[code];
}
