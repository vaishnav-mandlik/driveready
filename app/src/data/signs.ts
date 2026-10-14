import type {IconName} from '../components/Icon';
import {SIGNS} from '../content/signs';
import {currentLang, defineStrings, tr, type Lang} from '../i18n';
import {localizeSign} from '../i18n/content';
import type {SignCategory, SignInfo} from './types';

export interface SignCategoryMeta {
  id: SignCategory;
  title: string;
  description: string;
  icon: IconName;
}

const CATEGORY_TEXT = defineStrings<Record<Exclude<SignCategory, 'scenario'>, {title: string; description: string}>>(
  {
    regulatory: {title: 'Regulatory', description: 'Laws you must obey: stop, yield, speed limits, turns and lanes. Usually white rectangles with black or red legends.'},
    warning: {title: 'Warning', description: 'Hazards and changes ahead. Usually yellow diamonds with black symbols.'},
    school: {title: 'School Zones', description: 'School areas and crossings. Fluorescent yellow-green pentagons and plaques.'},
    railroad: {title: 'Railroad', description: 'Highway-rail grade crossings: crossbucks, advance warning and track signs.'},
    work_zone: {title: 'Work Zones', description: 'Temporary traffic control. Orange signs warn of roadwork, flaggers and lane closures.'},
    guide: {title: 'Guide', description: 'Route markers, destinations, exits and mileposts. Green, blue and brown signs.'},
    service: {title: 'Services', description: 'Gas, food, lodging, hospitals and other traveler services. Blue signs.'},
    recreation: {title: 'Recreation', description: 'Parks and points of interest. Brown signs.'},
    signal: {title: 'Traffic Signals', description: 'Signal lights, arrows and flashing signals.'},
    marking: {title: 'Pavement Markings', description: 'Lane lines, edge lines, crosswalks and other markings on the road.'},
    hand_signal: {title: 'Hand Signals', description: 'Arm signals drivers and cyclists use when lights are not available.'},
    other: {title: 'Other', description: 'Other signs and emblems you may be asked about.'},
  },
  {
    regulatory: {title: 'Reglamentarias', description: 'Leyes que debes obedecer: alto, ceda el paso, límites de velocidad, vueltas y carriles. Suelen ser rectángulos blancos con letras negras o rojas.'},
    warning: {title: 'Preventivas', description: 'Peligros y cambios más adelante. Suelen ser rombos amarillos con símbolos negros.'},
    school: {title: 'Zonas escolares', description: 'Áreas y cruces escolares. Pentágonos y placas de color amarillo verdoso fluorescente.'},
    railroad: {title: 'Ferrocarril', description: 'Cruces de ferrocarril a nivel: cruces en X, avisos anticipados y señales de vías.'},
    work_zone: {title: 'Zonas de obras', description: 'Control temporal del tránsito. Las señales anaranjadas avisan de obras, abanderados y cierres de carril.'},
    guide: {title: 'Informativas', description: 'Marcadores de ruta, destinos, salidas y postes de millaje. Señales verdes, azules y cafés.'},
    service: {title: 'Servicios', description: 'Gasolina, comida, hospedaje, hospitales y otros servicios para viajeros. Señales azules.'},
    recreation: {title: 'Recreación', description: 'Parques y lugares de interés. Señales cafés.'},
    signal: {title: 'Semáforos', description: 'Luces de semáforo, flechas y señales intermitentes.'},
    marking: {title: 'Marcas en el pavimento', description: 'Líneas de carril, líneas de borde, cruces peatonales y otras marcas en el camino.'},
    hand_signal: {title: 'Señales con la mano', description: 'Señales con el brazo que usan conductores y ciclistas cuando no hay luces disponibles.'},
    other: {title: 'Otras', description: 'Otras señales y emblemas por los que te pueden preguntar.'},
  },
);

const CATEGORY_ORDER: {id: Exclude<SignCategory, 'scenario'>; icon: IconName}[] = [
  {id: 'regulatory', icon: 'octagon'},
  {id: 'warning', icon: 'warning'},
  {id: 'school', icon: 'school'},
  {id: 'railroad', icon: 'train'},
  {id: 'work_zone', icon: 'construction'},
  {id: 'guide', icon: 'signpost'},
  {id: 'service', icon: 'info'},
  {id: 'recreation', icon: 'mountain'},
  {id: 'signal', icon: 'circle-dot'},
  {id: 'marking', icon: 'route'},
  {id: 'hand_signal', icon: 'hand'},
  {id: 'other', icon: 'shapes'},
];

/** Display order + copy for sign groups, in the current language. */
export function signCategories(): SignCategoryMeta[] {
  const text = tr(CATEGORY_TEXT);
  return CATEGORY_ORDER.map(c => ({id: c.id, icon: c.icon, ...text[c.id]}));
}

/** Signs in the current language (names/meanings fall back to English where untranslated). */
const localized = new Map<Lang, {byCode: Map<string, SignInfo>; library: SignInfo[]}>();

function signs() {
  const lang = currentLang();
  let hit = localized.get(lang);
  if (!hit) {
    const list = SIGNS.map(s => localizeSign(s, lang));
    hit = {byCode: new Map(list.map(s => [s.code, s])), library: list.filter(s => s.category !== 'scenario')};
    localized.set(lang, hit);
  }
  return hit;
}

export function getSign(code: string | undefined): SignInfo | undefined {
  return code ? signs().byCode.get(code) : undefined;
}

/** Signs, signals and markings for the library/flashcards (scenario illustrations excluded). */
export function allSigns(): SignInfo[] {
  return signs().library;
}

export function isScenario(code: string | undefined): boolean {
  return !!code && signs().byCode.get(code)?.category === 'scenario';
}

export function signsByCategory(): {meta: SignCategoryMeta; signs: SignInfo[]}[] {
  const library = allSigns();
  return signCategories()
    .map(meta => ({meta, signs: library.filter(s => s.category === meta.id)}))
    .filter(g => g.signs.length > 0);
}

const ACCENTS: Record<string, string> = {á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ñ: 'n'};
const fold = (s: string) => s.toLowerCase().replace(/[áéíóúüñ]/g, c => ACCENTS[c]);

export function searchSigns(query: string): SignInfo[] {
  const q = fold(query.trim());
  const library = allSigns();
  if (!q) {
    return library;
  }
  return library.filter(
    s =>
      fold(s.name).includes(q) ||
      fold(s.meaning).includes(q) ||
      s.code.toLowerCase().includes(q) ||
      fold(s.shape).includes(q) ||
      fold(s.shapeLabel ?? '').includes(q),
  );
}

/** For tests and language switches. */
export function clearSignCache() {
  localized.clear();
}
