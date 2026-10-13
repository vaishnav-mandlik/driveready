import type {IconName} from '../components/Icon';
import {SIGNS} from '../content/signs';
import type {SignCategory, SignInfo} from './types';

export interface SignCategoryMeta {
  id: SignCategory;
  title: string;
  description: string;
  icon: IconName;
}

/** Display order + copy for sign groups. */
export const SIGN_CATEGORIES: SignCategoryMeta[] = [
  {id: 'regulatory', title: 'Regulatory', description: 'Laws you must obey: stop, yield, speed limits, turns and lanes. Usually white rectangles with black or red legends.', icon: 'octagon'},
  {id: 'warning', title: 'Warning', description: 'Hazards and changes ahead. Usually yellow diamonds with black symbols.', icon: 'warning'},
  {id: 'school', title: 'School Zones', description: 'School areas and crossings. Fluorescent yellow-green pentagons and plaques.', icon: 'school'},
  {id: 'railroad', title: 'Railroad', description: 'Highway-rail grade crossings: crossbucks, advance warning and track signs.', icon: 'train'},
  {id: 'work_zone', title: 'Work Zones', description: 'Temporary traffic control. Orange signs warn of roadwork, flaggers and lane closures.', icon: 'construction'},
  {id: 'guide', title: 'Guide', description: 'Route markers, destinations, exits and mileposts. Green, blue and brown signs.', icon: 'signpost'},
  {id: 'service', title: 'Services', description: 'Gas, food, lodging, hospitals and other traveler services. Blue signs.', icon: 'info'},
  {id: 'recreation', title: 'Recreation', description: 'Parks and points of interest. Brown signs.', icon: 'mountain'},
  {id: 'signal', title: 'Traffic Signals', description: 'Signal lights, arrows and flashing signals.', icon: 'circle-dot'},
  {id: 'marking', title: 'Pavement Markings', description: 'Lane lines, edge lines, crosswalks and other markings on the road.', icon: 'route'},
  {id: 'hand_signal', title: 'Hand Signals', description: 'Arm signals drivers and cyclists use when lights are not available.', icon: 'hand'},
  {id: 'other', title: 'Other', description: 'Other signs and emblems you may be asked about.', icon: 'shapes'},
];

const byCode = new Map<string, SignInfo>(SIGNS.map(s => [s.code, s]));

export function getSign(code: string | undefined): SignInfo | undefined {
  return code ? byCode.get(code) : undefined;
}

export function allSigns(): SignInfo[] {
  return SIGNS;
}

export function signsByCategory(): {meta: SignCategoryMeta; signs: SignInfo[]}[] {
  return SIGN_CATEGORIES.map(meta => ({meta, signs: SIGNS.filter(s => s.category === meta.id)})).filter(
    g => g.signs.length > 0,
  );
}

export function searchSigns(query: string): SignInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return SIGNS;
  }
  return SIGNS.filter(
    s =>
      s.name.toLowerCase().includes(q) ||
      s.meaning.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.shape.toLowerCase().includes(q),
  );
}
