import type {IconName} from '../components/Icon';
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

const labelByKey = new Map(FACT_GROUPS.flatMap(g => g.keys.map(k => [k.key, k.label] as const)));

export function factLabel(key: FactKey): string {
  return labelByKey.get(key) ?? key.replace(/_/g, ' ');
}

/** Facts grouped for display, keeping only groups that have at least one fact. */
export function groupFacts(facts: StateFact[]): {group: FactGroup; facts: (StateFact & {label: string})[]}[] {
  const byKey = new Map(facts.map(f => [f.key, f]));
  return FACT_GROUPS.map(group => ({
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
