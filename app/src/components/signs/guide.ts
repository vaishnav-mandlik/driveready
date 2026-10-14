import type {SignCategory, SignInfo} from '../../data/types';
import {currentLang} from '../../i18n';

/**
 * "Shapes & colors" knowledge (MUTCD conventions taught in every state's
 * driver handbook) plus helpers that turn a sign's `shape` / `colors` text
 * into clues. Clues are category-aware so we never mislabel e.g. a round
 * route marker as a railroad warning.
 */

export type ShapeKind =
  | 'octagon'
  | 'yield'
  | 'diamond'
  | 'pentagon'
  | 'circle'
  | 'pennant'
  | 'crossbuck'
  | 'vrect'
  | 'hrect'
  | 'square'
  | 'shield'
  | 'trapezoid'
  | 'triangle';

export interface ShapeGuideEntry {
  kind: ShapeKind;
  title: string;
  meaning: string;
}

/** Shapes every learner should recognize at a glance (shown in the Signs tab guide). */
export const SHAPE_GUIDE: ShapeGuideEntry[] = [
  {kind: 'octagon', title: 'Octagon', meaning: 'Stop. This eight-sided shape is used only for STOP signs.'},
  {kind: 'yield', title: 'Triangle, point down', meaning: 'Yield. Slow down and let others go first. Used only for YIELD signs.'},
  {kind: 'diamond', title: 'Diamond', meaning: 'Warning. A hazard or change is ahead, like a curve, merge or crossing.'},
  {kind: 'pentagon', title: 'Pentagon', meaning: 'School zone or school crossing ahead. Watch for children.'},
  {kind: 'circle', title: 'Circle', meaning: 'Railroad crossing ahead. Look and listen for trains.'},
  {kind: 'pennant', title: 'Pennant', meaning: 'A no-passing zone begins. Posted on the left side of the road.'},
  {kind: 'crossbuck', title: 'Crossbuck', meaning: 'Railroad crossing. Yield to trains, and stop if one is coming.'},
  {kind: 'vrect', title: 'Vertical rectangle', meaning: 'Usually a rule you must obey, like a speed limit.'},
  {kind: 'hrect', title: 'Horizontal rectangle', meaning: 'Usually guide information: directions, distances and exits.'},
];

export type ColorKind = 'red' | 'yellow' | 'fyg' | 'orange' | 'blackwhite' | 'green' | 'blue' | 'brown' | 'pink' | 'purple';

export interface ColorGuideEntry {
  kind: ColorKind;
  title: string;
  meaning: string;
  /** Sign artwork colors (hard-coded on purpose: they are the real sign colors). */
  swatch: string[];
  /** Categories where this color carries the meaning above. */
  categories: SignCategory[];
}

export const COLOR_GUIDE: ColorGuideEntry[] = [
  {kind: 'red', title: 'Red', meaning: 'Stop, yield, do not enter, or not allowed.', swatch: ['#C1272D'], categories: ['regulatory', 'railroad', 'school', 'work_zone']},
  {kind: 'yellow', title: 'Yellow', meaning: 'General warning of what is ahead.', swatch: ['#FFCC00'], categories: ['warning', 'railroad', 'school']},
  {kind: 'fyg', title: 'Fluorescent yellow-green', meaning: 'Schools, school buses, playgrounds, and pedestrian or bicycle warnings.', swatch: ['#C6E000'], categories: ['school', 'warning']},
  {kind: 'orange', title: 'Orange', meaning: 'Work zones: road work, detours and flaggers.', swatch: ['#F47B20'], categories: ['work_zone']},
  {kind: 'blackwhite', title: 'Black and white', meaning: 'Regulations, such as speed limits and lane rules.', swatch: ['#FFFFFF', '#111111'], categories: ['regulatory', 'railroad']},
  {kind: 'green', title: 'Green', meaning: 'Directions and distances, and movements that are allowed.', swatch: ['#00704A'], categories: ['guide']},
  {kind: 'blue', title: 'Blue', meaning: 'Services for drivers, like gas, food, lodging and hospitals.', swatch: ['#1D4F91'], categories: ['service', 'guide']},
  {kind: 'brown', title: 'Brown', meaning: 'Parks, recreation areas and cultural sites.', swatch: ['#6F4A2B'], categories: ['recreation', 'guide']},
  {kind: 'pink', title: 'Fluorescent pink', meaning: 'Temporary routing around traffic incidents, like crashes.', swatch: ['#FF4F9A'], categories: ['work_zone', 'warning', 'other']},
  {kind: 'purple', title: 'Purple', meaning: 'Lanes only for vehicles with an electronic toll account.', swatch: ['#6B3FA0'], categories: ['guide', 'regulatory']},
];

type GuideText = {title: string; meaning: string};

/** Spanish shape-guide text keyed by kind (English lives in SHAPE_GUIDE). */
const SHAPE_ES: Partial<Record<ShapeKind, GuideText>> = {
  octagon: {title: 'Octágono', meaning: 'Alto. Esta figura de ocho lados se usa solo para las señales de ALTO (STOP).'},
  yield: {title: 'Triángulo, punta hacia abajo', meaning: 'Ceda el paso. Baja la velocidad y deja pasar primero a los demás. Se usa solo para las señales de CEDA EL PASO (YIELD).'},
  diamond: {title: 'Rombo', meaning: 'Advertencia. Hay un peligro o un cambio más adelante, como una curva, una incorporación o un cruce.'},
  pentagon: {title: 'Pentágono', meaning: 'Zona escolar o cruce escolar más adelante. Pon atención a los niños.'},
  circle: {title: 'Círculo', meaning: 'Cruce de ferrocarril más adelante. Mira y escucha por si vienen trenes.'},
  pennant: {title: 'Banderín', meaning: 'Comienza una zona de no rebasar. Se coloca en el lado izquierdo del camino.'},
  crossbuck: {title: 'Señal en forma de X', meaning: 'Cruce de ferrocarril. Cede el paso a los trenes y detente si viene uno.'},
  vrect: {title: 'Rectángulo vertical', meaning: 'Normalmente una regla que debes obedecer, como un límite de velocidad.'},
  hrect: {title: 'Rectángulo horizontal', meaning: 'Normalmente información de guía: direcciones, distancias y salidas.'},
};

/** Spanish color-guide text keyed by kind (English lives in COLOR_GUIDE). */
const COLOR_ES: Record<ColorKind, GuideText> = {
  red: {title: 'Rojo', meaning: 'Alto, ceda el paso, no entre o prohibido.'},
  yellow: {title: 'Amarillo', meaning: 'Advertencia general de lo que hay más adelante.'},
  fyg: {title: 'Amarillo verdoso fluorescente', meaning: 'Escuelas, autobuses escolares, áreas de juego y advertencias de peatones o bicicletas.'},
  orange: {title: 'Anaranjado', meaning: 'Zonas de obras: trabajos en el camino, desvíos y abanderados.'},
  blackwhite: {title: 'Blanco y negro', meaning: 'Reglamentos, como límites de velocidad y reglas de carriles.'},
  green: {title: 'Verde', meaning: 'Direcciones y distancias, y movimientos permitidos.'},
  blue: {title: 'Azul', meaning: 'Servicios para conductores, como gasolina, comida, hospedaje y hospitales.'},
  brown: {title: 'Café', meaning: 'Parques, áreas recreativas y sitios culturales.'},
  pink: {title: 'Rosa fluorescente', meaning: 'Desvíos temporales alrededor de incidentes de tránsito, como choques.'},
  purple: {title: 'Morado', meaning: 'Carriles solo para vehículos con cuenta electrónica de peaje.'},
};

function localizeShape(e: ShapeGuideEntry): ShapeGuideEntry {
  const t = currentLang() === 'es' ? SHAPE_ES[e.kind] : undefined;
  return t ? {...e, ...t} : e;
}

function localizeColor(e: ColorGuideEntry): ColorGuideEntry {
  const t = currentLang() === 'es' ? COLOR_ES[e.kind] : undefined;
  return t ? {...e, ...t} : e;
}

/** SHAPE_GUIDE in the current language. */
export function shapeGuide(): ShapeGuideEntry[] {
  return SHAPE_GUIDE.map(localizeShape);
}

/** COLOR_GUIDE in the current language. */
export function colorGuide(): ColorGuideEntry[] {
  return COLOR_GUIDE.map(localizeColor);
}

/** Signals, markings and hand signals follow different conventions; no shape/color clues for them. */
const NO_CLUES: SignCategory[] = ['signal', 'marking', 'hand_signal'];

/** Best-effort shape classification of free-text `SignInfo.shape`. */
export function shapeKindOf(shape: string): ShapeKind | null {
  const s = shape.toLowerCase();
  if (s.includes('octagon')) {
    return 'octagon';
  }
  if (s.includes('crossbuck')) {
    return 'crossbuck';
  }
  if (s.includes('pennant')) {
    return 'pennant';
  }
  if (s.includes('pentagon')) {
    return 'pentagon';
  }
  if (s.includes('diamond')) {
    return 'diamond';
  }
  if (s.includes('triangle')) {
    return /invert|down|upside/.test(s) ? 'yield' : 'triangle';
  }
  if (s.includes('circle') || s.includes('round')) {
    return 'circle';
  }
  if (s.includes('shield')) {
    return 'shield';
  }
  if (s.includes('trapezoid')) {
    return 'trapezoid';
  }
  if (s.includes('square')) {
    return 'square';
  }
  if (s.includes('rectangle')) {
    return /horizontal|wide|landscape/.test(s) ? 'hrect' : 'vrect';
  }
  return null;
}

const SHAPE_CLUE_SCOPE: Partial<Record<ShapeKind, SignCategory[] | 'any'>> = {
  octagon: 'any',
  yield: 'any',
  crossbuck: 'any',
  pennant: 'any',
  diamond: ['warning', 'work_zone', 'school', 'railroad'],
  pentagon: ['school'],
  circle: ['railroad'],
  vrect: ['regulatory'],
  hrect: ['guide', 'service'],
};

/** What this sign's shape tells a driver, when the shape has a reliable meaning for its category. */
export function shapeClue(sign: Pick<SignInfo, 'shape' | 'category'>): ShapeGuideEntry | null {
  if (NO_CLUES.includes(sign.category)) {
    return null;
  }
  const kind = shapeKindOf(sign.shape);
  const scope = kind ? SHAPE_CLUE_SCOPE[kind] : undefined;
  if (!kind || !scope || (scope !== 'any' && !scope.includes(sign.category))) {
    return null;
  }
  const entry = SHAPE_GUIDE.find(e => e.kind === kind);
  return entry ? localizeShape(entry) : null;
}

/** Color kinds mentioned in free-text `SignInfo.colors` (e.g. "Red with white legend"). */
export function colorKindsOf(colors: string): ColorKind[] {
  let s = ` ${colors.toLowerCase()} `;
  const out: ColorKind[] = [];
  if (/yellow[\s-]*green/.test(s)) {
    out.push('fyg');
    s = s.replace(/(fluorescent\s+)?yellow[\s-]*green/g, ' ');
  }
  const simple: [ColorKind, RegExp][] = [
    ['red', /\bred\b/],
    ['yellow', /\byellow\b/],
    ['orange', /\borange\b/],
    ['green', /\bgreen\b/],
    ['blue', /\bblue\b/],
    ['brown', /\bbrown\b/],
    ['pink', /\bpink\b/],
    ['purple', /\bpurple\b/],
  ];
  for (const [kind, re] of simple) {
    if (re.test(s)) {
      out.push(kind);
    }
  }
  if (/\b(white|black)\b/.test(s)) {
    out.push('blackwhite');
  }
  return out;
}

/**
 * What this sign's colors tell a driver. Black-and-white only counts when no
 * stronger color applies (most signs have a black or white legend).
 */
export function colorClues(sign: Pick<SignInfo, 'colors' | 'category'>): ColorGuideEntry[] {
  if (NO_CLUES.includes(sign.category)) {
    return [];
  }
  const kinds = colorKindsOf(sign.colors);
  const relevant = (k: ColorKind) => {
    const entry = COLOR_GUIDE.find(e => e.kind === k);
    return entry && entry.categories.includes(sign.category) ? localizeColor(entry) : null;
  };
  const strong = kinds
    .filter(k => k !== 'blackwhite')
    .map(relevant)
    .filter((e): e is ColorGuideEntry => !!e);
  if (strong.length) {
    return strong.slice(0, 2);
  }
  const bw = kinds.includes('blackwhite') ? relevant('blackwhite') : null;
  return bw ? [bw] : [];
}

/** Swatch colors to draw for a sign's color text (unknown colors are skipped). */
export function swatchesFor(colors: string): string[] {
  const s = colors.toLowerCase();
  const out: string[] = [];
  for (const kind of colorKindsOf(colors)) {
    if (kind === 'blackwhite') {
      if (/\bwhite\b/.test(s)) {
        out.push('#FFFFFF');
      }
      if (/\bblack\b/.test(s)) {
        out.push('#111111');
      }
    } else {
      const entry = COLOR_GUIDE.find(e => e.kind === kind);
      if (entry) {
        out.push(entry.swatch[0]);
      }
    }
  }
  return out.slice(0, 4);
}
