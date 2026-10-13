/**
 * TEST-ONLY synthetic content with the same shape as src/content/index.ts.
 * Usage in a test file:  jest.mock('../src/content', () => require('./fixtures/content'));
 * (adjust the relative paths to the test file's location).
 */
import type {Lesson, Question, StateCode, StateInfo, TrackId} from '../../src/data/types';

const q = (id: string, topic: Question['topic'], extra: Partial<Question> = {}): Question => ({
  id,
  track: 'car',
  topic,
  prompt: `Test question ${id}: what should you do?`,
  choices: ['Correct choice', 'Wrong choice one', 'Wrong choice two', 'Wrong choice three'],
  answer: 0,
  explanation: `Because the fixture says so for ${id}. This explanation is long enough.`,
  difficulty: 2,
  ...extra,
});

export const fixtureCar: Question[] = [
  q('t.car.sign.1', 'road-signs', {sign: 'R1-1', prompt: 'What does this sign mean?'}),
  q('t.car.sign.2', 'road-signs', {sign: 'R1-2', prompt: 'What must you do at this sign?'}),
  q('t.car.row.1', 'right-of-way'),
  q('t.car.row.2', 'right-of-way', {difficulty: 3}),
  q('t.car.park.1', 'parking'),
  q('t.car.speed.1', 'speed-space'),
  q('t.car.share.1', 'sharing-road'),
  q('t.car.haz.1', 'hazards-conditions'),
  q('t.car.alc.1', 'alcohol-drugs'),
  q('t.car.tf.1', 'safe-habits', {choices: ['True', 'False'], answer: 1, lockOrder: true}),
  q('t.car.free.1', 'freeway'),
  q('t.car.em.1', 'emergencies'),
];

export const fixtureCA: Question[] = [
  q('t.ca.1', 'laws-licensing', {states: ['CA']}),
  q('t.ca.2', 'parking', {states: ['CA']}),
  q('t.ca.3', 'alcohol-drugs', {states: ['CA']}),
];

export const fixtureMoto: Question[] = [
  {...q('t.mc.1', 'mc-gear-controls'), track: 'motorcycle'},
  {...q('t.mc.2', 'mc-basic-control'), track: 'motorcycle'},
];

export const fixtureCdl: Question[] = [
  {...q('t.cdl.1', 'cdl-general'), track: 'cdl'},
  {...q('t.cdl.2', 'cdl-air-brakes'), track: 'cdl'},
];

export const fixtureStateCA: StateInfo = {
  code: 'CA',
  name: 'California',
  agency: {name: 'Test Department of Motor Vehicles', abbreviation: 'DMV', website: 'https://example.gov'},
  handbook: {title: 'Test Driver Handbook', edition: '2026', url: 'https://example.gov/handbook.pdf'},
  exam: {
    questions: 10,
    passingScore: 8,
    passingPercent: 80,
    timeLimitMinutes: 20,
    roadSigns: null,
    format: 'Touch screen',
    languages: 'English, Spanish',
    retestWait: '7 days',
    notes: 'Fixture exam.',
    sourceUrl: 'https://example.gov/test',
  },
  motorcycleExam: null,
  cdlExam: null,
  facts: [
    {
      key: 'bac_limit_adult',
      value: '0.08%',
      detail: 'Fixture BAC detail.',
      number: 0.08,
      unit: '%',
      source: {url: 'https://example.gov/handbook.pdf', page: 12, quote: 'fixture quote'},
    },
    {
      key: 'parking_fire_hydrant',
      value: '15 feet',
      detail: 'Fixture hydrant detail.',
      number: 15,
      unit: 'feet',
      source: {url: 'https://example.gov/handbook.pdf', page: 40, quote: 'fixture quote'},
    },
  ],
  notableLaws: [{title: 'Fixture law', summary: 'A fixture notable law.', source: {url: 'https://example.gov', page: null, quote: 'q'}}],
  officialPracticeTests: [],
  verifiedOn: '2026-10-13',
};

export const fixtureLessons: Lesson[] = [
  {
    id: 't.lesson.signs',
    track: 'car',
    topic: 'road-signs',
    title: 'Fixture: Road Signs',
    summary: 'Shapes and colors.',
    minutes: 4,
    sections: [
      {
        heading: 'Shapes',
        blocks: [
          {type: 'p', text: 'An octagon always means stop.'},
          {type: 'sign', code: 'R1-1', caption: 'Stop'},
          {type: 'bullets', items: ['Octagon: stop', 'Triangle: yield']},
          {type: 'table', rows: [['Red', 'Stop or prohibited']]},
          {type: 'tip', text: 'Learn the shapes first.'},
        ],
      },
    ],
    keyPoints: ['Octagon = stop'],
  },
  {
    id: 't.lesson.roadtest',
    track: 'car',
    topic: 'road-test',
    title: 'Fixture: Road Test',
    summary: 'Prepare for the drive test.',
    minutes: 3,
    sections: [{heading: 'Before', blocks: [{type: 'steps', items: ['Bring documents', 'Check lights']}]}],
    keyPoints: ['Bring your permit'],
  },
];

export const universalQuestionLoaders: Record<TrackId, Array<() => Question[]>> = {
  car: [() => fixtureCar],
  motorcycle: [() => fixtureMoto],
  cdl: [() => fixtureCdl],
};

export const stateQuestionLoaders: Partial<Record<StateCode, () => Question[]>> = {
  CA: () => fixtureCA,
};

export const stateInfoLoaders: Partial<Record<StateCode, () => StateInfo>> = {
  CA: () => fixtureStateCA,
};

export const lessonLoaders: Array<() => Lesson> = fixtureLessons.map(l => () => l);
