/**
 * Core content + domain types shared by the content pipeline, the quiz
 * engine and every screen. Content JSON under src/content/ must match these.
 */

export type StateCode =
  | 'AL' | 'AK' | 'AZ' | 'AR' | 'CA' | 'CO' | 'CT' | 'DE' | 'DC' | 'FL'
  | 'GA' | 'HI' | 'ID' | 'IL' | 'IN' | 'IA' | 'KS' | 'KY' | 'LA' | 'ME'
  | 'MD' | 'MA' | 'MI' | 'MN' | 'MS' | 'MO' | 'MT' | 'NE' | 'NV' | 'NH'
  | 'NJ' | 'NM' | 'NY' | 'NC' | 'ND' | 'OH' | 'OK' | 'OR' | 'PA' | 'RI'
  | 'SC' | 'SD' | 'TN' | 'TX' | 'UT' | 'VT' | 'VA' | 'WA' | 'WV' | 'WI'
  | 'WY';

/** A "track" is a license type the learner is preparing for. */
export type TrackId = 'car' | 'motorcycle' | 'cdl';

export type CarTopicId =
  | 'road-signs'
  | 'signals-markings'
  | 'right-of-way'
  | 'intersections-turns'
  | 'lanes-passing'
  | 'speed-space'
  | 'parking'
  | 'freeway'
  | 'sharing-road'
  | 'hazards-conditions'
  | 'emergencies'
  | 'alcohol-drugs'
  | 'safe-habits'
  | 'laws-licensing';

export type MotoTopicId =
  | 'mc-gear-controls'
  | 'mc-basic-control'
  | 'mc-lane-position'
  | 'mc-intersections'
  | 'mc-crash-avoidance'
  | 'mc-passengers-groups'
  | 'mc-impairment'
  | 'mc-laws';

/** CDL topics double as the separate CDL knowledge tests (modules). */
export type CdlTopicId =
  | 'cdl-general'
  | 'cdl-air-brakes'
  | 'cdl-combination'
  | 'cdl-hazmat'
  | 'cdl-tanker'
  | 'cdl-doubles-triples'
  | 'cdl-passenger'
  | 'cdl-school-bus';

export type TopicId = CarTopicId | MotoTopicId | CdlTopicId;

export interface Question {
  /** Globally unique and stable forever (progress is keyed by it). */
  id: string;
  track: TrackId;
  topic: TopicId;
  prompt: string;
  /** 2–4 options. */
  choices: string[];
  /** Index into `choices` of the single correct option. */
  answer: number;
  /** Why the answer is right (and, ideally, why the tempting wrong one is wrong). */
  explanation: string;
  /** Road-sign / signal / marking code from the sign registry, shown above the prompt. */
  sign?: string;
  /** Present => only asked for these jurisdictions. Absent => valid in every state. */
  states?: StateCode[];
  /** 1 easy, 2 medium, 3 hard. */
  difficulty?: 1 | 2 | 3;
  /** Keep choices in authored order (True/False, "Both of the above"...). */
  lockOrder?: boolean;
  /** Human-readable source, e.g. "Texas Driver Handbook, p. 34". */
  ref?: string;
}

export type FactKey =
  | 'bac_limit_adult'
  | 'bac_limit_under21'
  | 'bac_limit_commercial'
  | 'implied_consent'
  | 'dui_first_offense'
  | 'open_container'
  | 'permit_min_age'
  | 'permit_holding_period'
  | 'supervised_driving_hours'
  | 'permit_supervisor'
  | 'provisional_license_min_age'
  | 'provisional_night_restriction'
  | 'provisional_passenger_restriction'
  | 'full_license_min_age'
  | 'handheld_phone_ban'
  | 'texting_ban'
  | 'novice_phone_ban'
  | 'seat_belt_law'
  | 'child_restraint_law'
  | 'basic_speed_law'
  | 'speed_limit_school_zone'
  | 'speed_limit_residential'
  | 'speed_limit_business_district'
  | 'speed_limit_rural_highway'
  | 'speed_limit_interstate_max'
  | 'minimum_speed_rule'
  | 'right_turn_on_red'
  | 'left_turn_on_red'
  | 'signal_distance'
  | 'emergency_vehicles'
  | 'move_over_law'
  | 'school_bus_stopping'
  | 'following_distance'
  | 'headlights_required'
  | 'high_beam_dim_oncoming'
  | 'high_beam_dim_following'
  | 'parking_fire_hydrant'
  | 'parking_crosswalk'
  | 'parking_intersection'
  | 'parking_stop_sign_signal'
  | 'parking_railroad'
  | 'parking_fire_station'
  | 'parking_curb_distance'
  | 'railroad_stop_distance'
  | 'bicycle_passing'
  | 'pedestrian_rules'
  | 'crash_reporting'
  | 'insurance_minimums'
  | 'point_system'
  | 'motorcycle_helmet_law'
  | 'motorcycle_lane_splitting';

export interface SourceRef {
  url: string;
  /** Page in the official handbook PDF (null for web pages). */
  page: number | null;
  quote: string;
}

export interface StateFact {
  key: FactKey;
  value: string;
  detail: string;
  number: number | null;
  unit: string | null;
  source: SourceRef;
}

export interface NotableLaw {
  title: string;
  summary: string;
  source: SourceRef;
}

/** A separately scored road-signs part of a knowledge test (e.g. NY: 2 of 4; GA: 15 of 20). */
export interface SignsSection {
  questions: number;
  /** Minimum correct in this part; null = counted only toward the overall score. */
  passingScore: number | null;
}

export interface ExamFormat {
  questions: number;
  passingScore: number;
  passingPercent: number;
  signs?: SignsSection | null;
  /** Minimum correct on the non-sign (rules) part when it is scored separately (GA, NC). */
  rulesPassingScore?: number | null;
  timeLimitMinutes: number | null;
  roadSigns: string | null;
  format: string | null;
  languages: string | null;
  retestWait: string | null;
  notes: string;
  sourceUrl: string;
}

export interface StateInfo {
  code: StateCode;
  name: string;
  agency: {name: string; abbreviation: string; website: string};
  handbook: {title: string; edition: string; url: string};
  exam: ExamFormat;
  motorcycleExam: Partial<ExamFormat> | null;
  cdlExam: Partial<ExamFormat> | null;
  facts: StateFact[];
  notableLaws: NotableLaw[];
  officialPracticeTests: string[];
  /** ISO date the facts were verified against official sources. */
  verifiedOn: string;
}

export type SignCategory =
  | 'regulatory'
  | 'warning'
  | 'guide'
  | 'service'
  | 'school'
  | 'railroad'
  | 'work_zone'
  | 'recreation'
  | 'signal'
  | 'marking'
  | 'hand_signal'
  | 'other'
  /** Illustrated driving situations used in questions (not shown in the sign library). */
  | 'scenario';

export interface SignInfo {
  /** MUTCD code (e.g. "R1-1") or an app code for signals/markings (e.g. "SIG-RED"). */
  code: string;
  name: string;
  category: SignCategory;
  shape: string;
  colors: string;
  /** What the sign means / what the driver must do. */
  meaning: string;
  /** Translated shape/colors for display (the English `shape`/`colors` stay for shape-clue logic). */
  shapeLabel?: string;
  colorsLabel?: string;
  /** SVG markup rendered with react-native-svg's SvgXml. */
  xml: string;
  /** width / height of the artwork. */
  aspect: number;
}

export type LessonBlock =
  | {type: 'p'; text: string}
  | {type: 'bullets'; items: string[]}
  | {type: 'steps'; items: string[]}
  | {type: 'tip'; text: string}
  | {type: 'warning'; text: string}
  | {type: 'sign'; code: string; caption?: string}
  | {type: 'signs'; codes: string[]}
  | {type: 'table'; rows: [string, string][]};

export interface LessonSection {
  heading: string;
  blocks: LessonBlock[];
}

export interface Lesson {
  id: string;
  track: TrackId;
  topic: TopicId | 'road-test';
  title: string;
  summary: string;
  minutes: number;
  sections: LessonSection[];
  keyPoints: string[];
}

/** One timed knowledge test the user can simulate. */
export interface ExamConfig {
  id: string;
  track: TrackId;
  /** CDL modules (and topic-scoped exams) restrict the pool to one topic. */
  topic?: TopicId;
  title: string;
  questions: number;
  passingScore: number;
  timeLimitMinutes: number | null;
  /** Separately scored road-signs part, if the state has one. */
  signs?: SignsSection | null;
  rulesPassingScore?: number | null;
  /** Shown on the exam intro screen (format, signs section, source...). */
  notes: string;
  sourceUrl?: string;
}

/* ---- Translations (src/content/i18n/<lang>/..., mirroring the English source paths) ---- */

/** One translated question; `h` is the fingerprint of the English it was translated from. */
export interface QuestionTranslation {
  p: string;
  c: string[];
  e: string;
  h: string;
}

export interface LessonTranslation {
  id: string;
  h: string;
  title: string;
  summary: string;
  sections: LessonSection[];
  keyPoints: string[];
}

export interface SignTranslation {
  h: string;
  name: string;
  meaning: string;
  shape: string;
  colors: string;
}

/** Lazy loaders for one language's translations (generated into src/content/index.ts). */
export interface TranslationLoaders {
  universal: Record<TrackId, Array<() => Record<string, QuestionTranslation>>>;
  states: Partial<Record<StateCode, () => Record<string, QuestionTranslation>>>;
  /** Translation memory for state info text (facts, laws, exam notes), keyed by textHash(English). */
  stateInfo: Partial<Record<StateCode, () => Record<string, string>>>;
  lessons: Array<() => LessonTranslation>;
  signs: Array<() => Record<string, SignTranslation>>;
}
