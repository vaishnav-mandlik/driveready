import type {IconName} from '../components/Icon';
import {currentLang} from '../i18n';
import type {FactKey, StateFact} from './types';

export interface FactGroup {
  id: string;
  title: string;
  icon: IconName;
  keys: {key: FactKey; label: string}[];
}

/** How verified state facts are grouped and labeled on the State Cheat Sheet. */
export const FACT_GROUPS: FactGroup[] = [
  {
    id: 'alcohol',
    title: 'Alcohol & Drugs',
    icon: 'wine',
    keys: [
      {key: 'bac_limit_adult', label: 'BAC limit, 21 and older'},
      {key: 'bac_limit_under21', label: 'BAC limit, under 21'},
      {key: 'bac_limit_commercial', label: 'BAC limit, commercial drivers'},
      {key: 'implied_consent', label: 'Refusing a chemical test'},
      {key: 'dui_first_offense', label: 'First DUI penalty'},
      {key: 'open_container', label: 'Open containers'},
    ],
  },
  {
    id: 'teen',
    title: 'Permits & Teen Drivers',
    icon: 'graduation',
    keys: [
      {key: 'permit_min_age', label: 'Minimum permit age'},
      {key: 'permit_holding_period', label: 'Hold permit for'},
      {key: 'supervised_driving_hours', label: 'Supervised practice'},
      {key: 'permit_supervisor', label: 'Who can supervise'},
      {key: 'provisional_license_min_age', label: 'Provisional license age'},
      {key: 'provisional_night_restriction', label: 'Night driving limit'},
      {key: 'provisional_passenger_restriction', label: 'Passenger limit'},
      {key: 'full_license_min_age', label: 'Unrestricted license'},
    ],
  },
  {
    id: 'phones',
    title: 'Phones & Distraction',
    icon: 'phone',
    keys: [
      {key: 'handheld_phone_ban', label: 'Handheld phones'},
      {key: 'texting_ban', label: 'Texting'},
      {key: 'novice_phone_ban', label: 'Teen & permit drivers'},
    ],
  },
  {
    id: 'occupants',
    title: 'Seat Belts & Child Seats',
    icon: 'shield-check',
    keys: [
      {key: 'seat_belt_law', label: 'Seat belts'},
      {key: 'child_restraint_law', label: 'Child restraints'},
    ],
  },
  {
    id: 'speed',
    title: 'Speed Limits',
    icon: 'gauge',
    keys: [
      {key: 'basic_speed_law', label: 'Basic speed law'},
      {key: 'speed_limit_school_zone', label: 'School zones'},
      {key: 'speed_limit_residential', label: 'Residential'},
      {key: 'speed_limit_business_district', label: 'Business district'},
      {key: 'speed_limit_rural_highway', label: 'Rural highways'},
      {key: 'speed_limit_interstate_max', label: 'Interstates'},
      {key: 'minimum_speed_rule', label: 'Driving too slowly'},
    ],
  },
  {
    id: 'turns',
    title: 'Turns, Signals & Right-of-Way',
    icon: 'turn-right',
    keys: [
      {key: 'right_turn_on_red', label: 'Right on red'},
      {key: 'left_turn_on_red', label: 'Left on red'},
      {key: 'signal_distance', label: 'Signal before turning'},
      {key: 'pedestrian_rules', label: 'Pedestrians'},
      {key: 'bicycle_passing', label: 'Passing cyclists'},
    ],
  },
  {
    id: 'emergency',
    title: 'Emergency Vehicles & School Buses',
    icon: 'siren',
    keys: [
      {key: 'emergency_vehicles', label: 'Emergency vehicles'},
      {key: 'move_over_law', label: 'Move over law'},
      {key: 'school_bus_stopping', label: 'Stopped school buses'},
      {key: 'railroad_stop_distance', label: 'Railroad crossings'},
    ],
  },
  {
    id: 'visibility',
    title: 'Following Distance & Lights',
    icon: 'eye',
    keys: [
      {key: 'following_distance', label: 'Following distance'},
      {key: 'headlights_required', label: 'Headlights required'},
      {key: 'high_beam_dim_oncoming', label: 'Dim for oncoming traffic'},
      {key: 'high_beam_dim_following', label: 'Dim when following'},
    ],
  },
  {
    id: 'parking',
    title: 'Parking Distances',
    icon: 'parking',
    keys: [
      {key: 'parking_fire_hydrant', label: 'Fire hydrant'},
      {key: 'parking_crosswalk', label: 'Crosswalk'},
      {key: 'parking_intersection', label: 'Intersection'},
      {key: 'parking_stop_sign_signal', label: 'Stop sign / signal'},
      {key: 'parking_railroad', label: 'Railroad crossing'},
      {key: 'parking_fire_station', label: 'Fire station entrance'},
      {key: 'parking_curb_distance', label: 'Distance from curb'},
    ],
  },
  {
    id: 'legal',
    title: 'Crashes, Insurance & Points',
    icon: 'landmark',
    keys: [
      {key: 'crash_reporting', label: 'Reporting a crash'},
      {key: 'insurance_minimums', label: 'Minimum insurance'},
      {key: 'point_system', label: 'Point system'},
    ],
  },
  {
    id: 'motorcycle',
    title: 'Motorcycles',
    icon: 'motorbike',
    keys: [
      {key: 'motorcycle_helmet_law', label: 'Helmets'},
      {key: 'motorcycle_lane_splitting', label: 'Lane splitting'},
    ],
  },
];

/** Spanish group titles, keyed by group id. */
const GROUP_TITLES_ES: Record<string, string> = {
  alcohol: 'Alcohol y drogas',
  teen: 'Permisos y conductores jóvenes',
  phones: 'Celulares y distracciones',
  occupants: 'Cinturones y asientos infantiles',
  speed: 'Límites de velocidad',
  turns: 'Vueltas, señales y derecho de paso',
  emergency: 'Vehículos de emergencia y autobuses escolares',
  visibility: 'Distancia de seguimiento y luces',
  parking: 'Distancias para estacionarse',
  legal: 'Choques, seguro y puntos',
  motorcycle: 'Motocicletas',
};

/** Spanish fact labels, keyed by fact key. */
const LABELS_ES: Partial<Record<FactKey, string>> = {
  bac_limit_adult: 'Límite de BAC, 21 años o más',
  bac_limit_under21: 'Límite de BAC, menores de 21',
  bac_limit_commercial: 'Límite de BAC, conductores comerciales',
  implied_consent: 'Negarse a una prueba química',
  dui_first_offense: 'Pena por primer DUI',
  open_container: 'Envases abiertos',
  permit_min_age: 'Edad mínima para el permiso',
  permit_holding_period: 'Tener el permiso durante',
  supervised_driving_hours: 'Práctica supervisada',
  permit_supervisor: 'Quién puede supervisar',
  provisional_license_min_age: 'Edad para licencia provisional',
  provisional_night_restriction: 'Límite para manejar de noche',
  provisional_passenger_restriction: 'Límite de pasajeros',
  full_license_min_age: 'Licencia sin restricciones',
  handheld_phone_ban: 'Celular en la mano',
  texting_ban: 'Mensajes de texto',
  novice_phone_ban: 'Conductores jóvenes y con permiso',
  seat_belt_law: 'Cinturones de seguridad',
  child_restraint_law: 'Asientos de seguridad infantil',
  basic_speed_law: 'Ley básica de velocidad',
  speed_limit_school_zone: 'Zonas escolares',
  speed_limit_residential: 'Zonas residenciales',
  speed_limit_business_district: 'Distrito comercial',
  speed_limit_rural_highway: 'Carreteras rurales',
  speed_limit_interstate_max: 'Autopistas interestatales',
  minimum_speed_rule: 'Manejar demasiado lento',
  right_turn_on_red: 'Vuelta a la derecha en rojo',
  left_turn_on_red: 'Vuelta a la izquierda en rojo',
  signal_distance: 'Señalizar antes de dar vuelta',
  pedestrian_rules: 'Peatones',
  bicycle_passing: 'Rebasar a ciclistas',
  emergency_vehicles: 'Vehículos de emergencia',
  move_over_law: 'Ley "Move Over"',
  school_bus_stopping: 'Autobuses escolares detenidos',
  railroad_stop_distance: 'Cruces de ferrocarril',
  following_distance: 'Distancia de seguimiento',
  headlights_required: 'Cuándo usar las luces delanteras',
  high_beam_dim_oncoming: 'Bajar luces ante tráfico de frente',
  high_beam_dim_following: 'Bajar luces al seguir a otro',
  parking_fire_hydrant: 'Hidrante',
  parking_crosswalk: 'Cruce peatonal',
  parking_intersection: 'Intersección',
  parking_stop_sign_signal: 'Señal de alto / semáforo',
  parking_railroad: 'Cruce de ferrocarril',
  parking_fire_station: 'Entrada de estación de bomberos',
  parking_curb_distance: 'Distancia del bordillo',
  crash_reporting: 'Reportar un choque',
  insurance_minimums: 'Seguro mínimo',
  point_system: 'Sistema de puntos',
  motorcycle_helmet_law: 'Cascos',
  motorcycle_lane_splitting: 'Circular entre carriles',
};

/** FACT_GROUPS with titles and labels in the current language (English data stays in FACT_GROUPS). */
export function factGroups(): FactGroup[] {
  if (currentLang() !== 'es') {
    return FACT_GROUPS;
  }
  return FACT_GROUPS.map(g => ({
    ...g,
    title: GROUP_TITLES_ES[g.id] ?? g.title,
    keys: g.keys.map(k => ({key: k.key, label: LABELS_ES[k.key] ?? k.label})),
  }));
}

const labelByKey = new Map(FACT_GROUPS.flatMap(g => g.keys.map(k => [k.key, k.label] as const)));

/** Label of a fact in the current language. */
export function factLabel(key: FactKey): string {
  const en = labelByKey.get(key);
  if (currentLang() === 'es') {
    return LABELS_ES[key] ?? en ?? key.replace(/_/g, ' ');
  }
  return en ?? key.replace(/_/g, ' ');
}

/** Facts grouped for display (localized titles/labels), keeping only groups that have at least one fact. */
export function groupFacts(facts: StateFact[]): {group: FactGroup; facts: (StateFact & {label: string})[]}[] {
  const byKey = new Map(facts.map(f => [f.key, f]));
  return factGroups().map(group => ({
    group,
    facts: group.keys
      .map(k => {
        const f = byKey.get(k.key);
        return f ? {...f, label: k.label} : null;
      })
      .filter((f): f is StateFact & {label: string} => f !== null),
  })).filter(g => g.facts.length > 0);
}

/** The handful of numbers most likely to appear on any state's test. */
export const KEY_NUMBER_FACTS: FactKey[] = [
  'bac_limit_adult',
  'bac_limit_under21',
  'parking_fire_hydrant',
  'following_distance',
  'high_beam_dim_oncoming',
  'signal_distance',
  'speed_limit_school_zone',
  'railroad_stop_distance',
];
