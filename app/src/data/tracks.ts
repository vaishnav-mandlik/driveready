import type {IconName} from '../components/Icon';
import {currentLang, type Lang} from '../i18n';
import type {TopicId, TrackId} from './types';

export interface TopicMeta {
  id: TopicId;
  track: TrackId;
  title: string;
  description: string;
  icon: IconName;
  /** Index into the theme's hue palette. */
  hue: number;
}

export interface TrackMeta {
  id: TrackId;
  title: string;
  /** Short label for chips/headers. */
  short: string;
  license: string;
  description: string;
  icon: IconName;
  topics: TopicMeta[];
}

const car: TopicMeta[] = [
  {id: 'road-signs', track: 'car', title: 'Road Signs', description: 'Shapes, colors and meanings of regulatory, warning, guide and work-zone signs.', icon: 'signpost', hue: 2},
  {id: 'signals-markings', track: 'car', title: 'Signals & Pavement Markings', description: 'Traffic lights, arrows, flashing signals, lane lines and other pavement markings.', icon: 'cone', hue: 4},
  {id: 'right-of-way', track: 'car', title: 'Right-of-Way', description: 'Who goes first at intersections, crosswalks, roundabouts and merges.', icon: 'split', hue: 0},
  {id: 'intersections-turns', track: 'car', title: 'Intersections & Turns', description: 'Turning lanes, U-turns, turns on red, roundabouts and lane choice.', icon: 'turn-right', hue: 5},
  {id: 'lanes-passing', track: 'car', title: 'Lanes, Passing & Merging', description: 'Lane use, changing lanes, passing safely and being passed.', icon: 'route', hue: 3},
  {id: 'speed-space', track: 'car', title: 'Speed & Space', description: 'Speed limits, following distance, stopping distance and space cushions.', icon: 'gauge', hue: 1},
  {id: 'parking', track: 'car', title: 'Parking', description: 'Where parking is prohibited, curb colors, hills and parallel parking.', icon: 'parking', hue: 6},
  {id: 'freeway', track: 'car', title: 'Freeways & Highways', description: 'Entering, exiting and driving on high-speed, limited-access roads.', icon: 'milestone', hue: 0},
  {id: 'sharing-road', track: 'car', title: 'Sharing the Road', description: 'Pedestrians, cyclists, motorcycles, trucks, buses, trains and emergency vehicles.', icon: 'bike', hue: 1},
  {id: 'hazards-conditions', track: 'car', title: 'Night, Weather & Hazards', description: 'Low light, rain, fog, snow, ice, work zones and defensive driving.', icon: 'rain', hue: 5},
  {id: 'emergencies', track: 'car', title: 'Emergencies & Crashes', description: 'Skids, blowouts, brake failure, breakdowns and what to do after a crash.', icon: 'siren', hue: 4},
  {id: 'alcohol-drugs', track: 'car', title: 'Alcohol & Drugs', description: 'Impairment, BAC limits, implied consent and DUI penalties.', icon: 'wine', hue: 3},
  {id: 'safe-habits', track: 'car', title: 'Safe Driving Habits', description: 'Distraction, drowsiness, seat belts, road rage and vehicle condition.', icon: 'shield-check', hue: 2},
  {id: 'laws-licensing', track: 'car', title: 'Licensing & State Laws', description: 'Permits, teen restrictions, insurance, points and your state’s specific rules.', icon: 'id-card', hue: 7},
];

const motorcycle: TopicMeta[] = [
  {id: 'mc-gear-controls', track: 'motorcycle', title: 'Gear, Controls & Inspection', description: 'Protective gear, helmets, motorcycle controls and the pre-ride check.', icon: 'hard-hat', hue: 2},
  {id: 'mc-basic-control', track: 'motorcycle', title: 'Basic Vehicle Control', description: 'Body position, shifting, braking and turning.', icon: 'motorbike', hue: 0},
  {id: 'mc-lane-position', track: 'motorcycle', title: 'Lane Position & Space', description: 'Lane positions, following distance, passing and the SEE strategy.', icon: 'route', hue: 1},
  {id: 'mc-intersections', track: 'motorcycle', title: 'Intersections & Being Seen', description: 'Intersection strategy, blind spots, signals, headlights and conspicuity.', icon: 'eye', hue: 5},
  {id: 'mc-crash-avoidance', track: 'motorcycle', title: 'Crash Avoidance & Hazards', description: 'Quick stops, swerving, slippery surfaces, mechanical problems and animals.', icon: 'warning', hue: 4},
  {id: 'mc-passengers-groups', track: 'motorcycle', title: 'Passengers, Cargo & Groups', description: 'Carrying passengers and loads, and riding in a group.', icon: 'users', hue: 3},
  {id: 'mc-impairment', track: 'motorcycle', title: 'Alcohol, Drugs & Fatigue', description: 'How impairment affects riding skills and the legal consequences.', icon: 'wine', hue: 6},
  {id: 'mc-laws', track: 'motorcycle', title: 'Motorcycle Laws & Licensing', description: 'Your state’s helmet, lane-splitting, permit and endorsement rules.', icon: 'id-card', hue: 7},
];

const cdl: TopicMeta[] = [
  {id: 'cdl-general', track: 'cdl', title: 'General Knowledge', description: 'Inspection, basic control, shifting, seeing, space, hazards, cargo and more.', icon: 'truck', hue: 0},
  {id: 'cdl-air-brakes', track: 'cdl', title: 'Air Brakes', description: 'Air brake system parts, inspection and safe use.', icon: 'circle-dot', hue: 4},
  {id: 'cdl-combination', track: 'cdl', title: 'Combination Vehicles', description: 'Coupling, uncoupling, trailer air systems and rollover risks.', icon: 'trailer', hue: 5},
  {id: 'cdl-hazmat', track: 'cdl', title: 'Hazardous Materials', description: 'Shipping papers, placards, loading and emergencies.', icon: 'biohazard', hue: 2},
  {id: 'cdl-tanker', track: 'cdl', title: 'Tank Vehicles', description: 'Liquid surge, baffles, outage and high center of gravity.', icon: 'droplets', hue: 1},
  {id: 'cdl-doubles-triples', track: 'cdl', title: 'Doubles & Triples', description: 'Pulling double and triple trailers, coupling and converter dollies.', icon: 'layers', hue: 3},
  {id: 'cdl-passenger', track: 'cdl', title: 'Passenger Transport', description: 'Bus inspections, loading, emergency exits and passenger safety.', icon: 'bus', hue: 6},
  {id: 'cdl-school-bus', track: 'cdl', title: 'School Bus', description: 'Danger zones, mirrors, loading/unloading and railroad crossings.', icon: 'school', hue: 7},
];

export const TRACKS: TrackMeta[] = [
  {
    id: 'car',
    title: 'Car',
    short: 'Car',
    license: 'Learner’s permit & driver’s license',
    description: 'The standard written knowledge test for a learner’s permit or regular driver’s license.',
    icon: 'car',
    topics: car,
  },
  {
    id: 'motorcycle',
    title: 'Motorcycle',
    short: 'Motorcycle',
    license: 'Motorcycle permit & endorsement',
    description: 'The motorcycle knowledge test for a motorcycle permit, license or endorsement.',
    icon: 'motorbike',
    topics: motorcycle,
  },
  {
    id: 'cdl',
    title: 'Commercial (CDL)',
    short: 'CDL',
    license: 'Commercial learner’s permit (CLP)',
    description: 'CDL general knowledge plus air brakes, combination, hazmat, tanker, doubles/triples, passenger and school bus.',
    icon: 'truck',
    topics: cdl,
  },
];

type TopicText = {title: string; description: string};
type TrackText = {title: string; short: string; license: string; description: string};

/** Spanish topic/track text keyed by id (English stays in the arrays above). */
const ES_TOPICS: Record<TopicId, TopicText> = {
  'road-signs': {title: 'Señales de tránsito', description: 'Formas, colores y significados de las señales reglamentarias, preventivas, informativas y de zonas de obras.'},
  'signals-markings': {title: 'Semáforos y marcas en el pavimento', description: 'Semáforos, flechas, señales intermitentes, líneas de carril y otras marcas en el pavimento.'},
  'right-of-way': {title: 'Derecho de paso', description: 'Quién pasa primero en intersecciones, cruces peatonales, glorietas e incorporaciones.'},
  'intersections-turns': {title: 'Intersecciones y vueltas', description: 'Carriles para dar vuelta, vueltas en U, vueltas con luz roja, glorietas y elección de carril.'},
  'lanes-passing': {title: 'Carriles, rebasar e incorporarse', description: 'Uso de carriles, cambios de carril, rebasar con seguridad y cuando te rebasan.'},
  'speed-space': {title: 'Velocidad y espacio', description: 'Límites de velocidad, distancia de seguimiento, distancia para detenerte y espacio de seguridad.'},
  parking: {title: 'Estacionamiento', description: 'Dónde está prohibido estacionarse, colores del borde de la acera, pendientes y estacionamiento en paralelo.'},
  freeway: {title: 'Autopistas y carreteras', description: 'Entrar, salir y manejar en vías de alta velocidad y acceso controlado.'},
  'sharing-road': {title: 'Compartir el camino', description: 'Peatones, ciclistas, motocicletas, camiones, autobuses, trenes y vehículos de emergencia.'},
  'hazards-conditions': {title: 'Noche, clima y peligros', description: 'Poca luz, lluvia, niebla, nieve, hielo, zonas de obras y manejo defensivo.'},
  emergencies: {title: 'Emergencias y choques', description: 'Derrapes, reventones, falla de frenos, descomposturas y qué hacer después de un choque.'},
  'alcohol-drugs': {title: 'Alcohol y drogas', description: 'Facultades disminuidas, límites de BAC, consentimiento implícito y sanciones por DUI.'},
  'safe-habits': {title: 'Hábitos de manejo seguro', description: 'Distracciones, somnolencia, cinturón de seguridad, furia al volante y estado del vehículo.'},
  'laws-licensing': {title: 'Licencias y leyes estatales', description: 'Permisos, restricciones para adolescentes, seguro, puntos y las reglas específicas de tu estado.'},
  'mc-gear-controls': {title: 'Equipo, controles e inspección', description: 'Equipo de protección, cascos, controles de la motocicleta y la revisión antes de manejar.'},
  'mc-basic-control': {title: 'Control básico del vehículo', description: 'Posición del cuerpo, cambios de velocidad, frenado y vueltas.'},
  'mc-lane-position': {title: 'Posición en el carril y espacio', description: 'Posiciones en el carril, distancia de seguimiento, rebasar y la estrategia SEE.'},
  'mc-intersections': {title: 'Intersecciones y visibilidad', description: 'Estrategia en intersecciones, puntos ciegos, señales, faros y cómo hacerte notar.'},
  'mc-crash-avoidance': {title: 'Evitar choques y peligros', description: 'Frenadas rápidas, maniobras evasivas, superficies resbalosas, fallas mecánicas y animales.'},
  'mc-passengers-groups': {title: 'Pasajeros, carga y grupos', description: 'Llevar pasajeros y carga, y manejar en grupo.'},
  'mc-impairment': {title: 'Alcohol, drogas y fatiga', description: 'Cómo afectan a tus habilidades para manejar y sus consecuencias legales.'},
  'mc-laws': {title: 'Leyes y licencias de motocicleta', description: 'Las reglas de tu estado sobre casco, circular entre carriles, permiso y endoso.'},
  'cdl-general': {title: 'Conocimientos generales', description: 'Inspección, control básico, cambios, visibilidad, espacio, peligros, carga y más.'},
  'cdl-air-brakes': {title: 'Frenos de aire', description: 'Partes del sistema de frenos de aire, inspección y uso seguro.'},
  'cdl-combination': {title: 'Vehículos combinados', description: 'Acoplar, desacoplar, sistemas de aire del remolque y riesgo de volcadura.'},
  'cdl-hazmat': {title: 'Materiales peligrosos', description: 'Documentos de envío, letreros, carga y emergencias.'},
  'cdl-tanker': {title: 'Vehículos cisterna', description: 'Oleaje del líquido, deflectores, espacio de expansión y centro de gravedad alto.'},
  'cdl-doubles-triples': {title: 'Remolques dobles y triples', description: 'Arrastrar remolques dobles y triples, acoplamiento y plataformas convertidoras (dollies).'},
  'cdl-passenger': {title: 'Transporte de pasajeros', description: 'Inspección del autobús, abordaje, salidas de emergencia y seguridad de los pasajeros.'},
  'cdl-school-bus': {title: 'Autobús escolar', description: 'Zonas de peligro, espejos, subida y bajada de alumnos y cruces de ferrocarril.'},
};

const ES_TRACKS: Record<TrackId, TrackText> = {
  car: {
    title: 'Auto',
    short: 'Auto',
    license: 'Permiso de aprendizaje y licencia de manejo',
    description: 'El examen de conocimientos estándar para el permiso de aprendizaje o la licencia de manejo regular.',
  },
  motorcycle: {
    title: 'Motocicleta',
    short: 'Motocicleta',
    license: 'Permiso y endoso de motocicleta',
    description: 'El examen de conocimientos de motocicleta para el permiso, la licencia o el endoso de motocicleta.',
  },
  cdl: {
    title: 'Comercial (CDL)',
    short: 'CDL',
    license: 'Permiso de aprendizaje comercial (CLP)',
    description: 'Conocimientos generales de CDL más frenos de aire, combinados, materiales peligrosos, cisterna, dobles/triples, pasajeros y autobús escolar.',
  },
};

/** Localized copies of TRACKS, built once per language so object identity stays stable. */
const localizedTracks = new Map<Lang, TrackMeta[]>([['en', TRACKS]]);

function tracksFor(lang: Lang): TrackMeta[] {
  let list = localizedTracks.get(lang);
  if (!list) {
    list = TRACKS.map(t => ({
      ...t,
      ...ES_TRACKS[t.id],
      topics: t.topics.map(topic => ({...topic, ...ES_TOPICS[topic.id]})),
    }));
    localizedTracks.set(lang, list);
  }
  return list;
}

const indexCache = new Map<Lang, {tracks: Map<TrackId, TrackMeta>; topics: Map<TopicId, TopicMeta>}>();

function index(): {tracks: Map<TrackId, TrackMeta>; topics: Map<TopicId, TopicMeta>} {
  const lang = currentLang();
  let idx = indexCache.get(lang);
  if (!idx) {
    const list = tracksFor(lang);
    idx = {
      tracks: new Map(list.map(t => [t.id, t])),
      topics: new Map(list.flatMap(t => t.topics).map(t => [t.id, t])),
    };
    indexCache.set(lang, idx);
  }
  return idx;
}

/** All tracks in the current language (use this instead of `TRACKS` in UI). */
export function tracks(): TrackMeta[] {
  return tracksFor(currentLang());
}

/** The track in the current language. */
export function getTrack(id: TrackId): TrackMeta {
  const idx = index();
  return idx.tracks.get(id) ?? tracks()[0];
}

/** The topic in the current language. */
export function getTopic(id: TopicId): TopicMeta | undefined {
  return index().topics.get(id);
}

export function topicTitle(id: TopicId): string {
  return getTopic(id)?.title ?? id;
}

export const ALL_TOPIC_IDS = TRACKS.flatMap(t => t.topics).map(t => t.id);
