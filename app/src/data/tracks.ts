import type {IconName} from '../components/Icon';
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

const trackById = new Map(TRACKS.map(t => [t.id, t]));
const topicById = new Map(TRACKS.flatMap(t => t.topics).map(t => [t.id, t]));

export function getTrack(id: TrackId): TrackMeta {
  return trackById.get(id) ?? TRACKS[0];
}

export function getTopic(id: TopicId): TopicMeta | undefined {
  return topicById.get(id);
}

export function topicTitle(id: TopicId): string {
  return topicById.get(id)?.title ?? id;
}

export const ALL_TOPIC_IDS = Array.from(topicById.keys());
