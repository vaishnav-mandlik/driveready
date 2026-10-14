import {clearBankCache, getBank, searchBank} from '../../src/data/bank';
import {getLesson} from '../../src/data/lessons';
import {getSign} from '../../src/data/signs';
import {getStateInfo, stateList, stateName} from '../../src/data/states';
import {defineStrings, tr} from '../../src/i18n';
import {fnv1a, lessonHash, questionHash, signHash} from '../../src/i18n/hash';
import {useSettings} from '../../src/store/settings';

jest.mock('../../src/content', () => require('../fixtures/content'));

const setLang = (language: 'en' | 'es') => useSettings.setState({language});

beforeEach(() => {
  clearBankCache();
  setLang('en');
});
afterAll(() => setLang('en'));

describe('translation fingerprints', () => {
  test('match the values computed by scripts/i18n-lib.mjs', () => {
    // Reference values printed by the Node implementation (non-ASCII text included on purpose).
    expect(fnv1a('DriveReady ✓ ñ 15 feet')).toBe('uk0ouu');
    expect(questionHash({prompt: 'Señal ✓ 15 feet?', choices: ['Alto', 'Ceda el paso'], explanation: 'Porque sí — 0.08%.'})).toBe('st5gs3');
    expect(lessonHash({title: 't', summary: 's', sections: [{heading: 'h', blocks: [{type: 'p', text: 'x'}]}], keyPoints: ['k']})).toBe('16k6v4g');
    expect(signHash({name: 'Stop', meaning: 'm', shape: 'octagon', colors: 'red, white'})).toBe('1kkfi2l');
  });
});

describe('Spanish content', () => {
  test('questions are translated where current, and stale translations fall back to English', () => {
    const en = getBank('car', 'CA');
    setLang('es');
    const es = getBank('car', 'CA');
    expect(es).not.toBe(en);
    expect(es.byId.get('t.car.row.1')!.prompt).toBe('Pregunta de prueba t.car.row.1: ¿qué debe hacer?');
    expect(es.byId.get('t.car.row.1')!.choices[0]).toBe('Opción correcta');
    expect(es.byId.get('t.car.row.1')!.answer).toBe(en.byId.get('t.car.row.1')!.answer);
    // English changed after translation -> show the English.
    expect(es.byId.get('t.car.row.2')!.prompt).toBe(en.byId.get('t.car.row.2')!.prompt);
    // State questions and untranslated ones.
    expect(es.byId.get('t.ca.1')!.prompt).toContain('¿qué debe hacer?');
    expect(es.byId.get('t.car.park.1')!.prompt).toBe(en.byId.get('t.car.park.1')!.prompt);
    // Switching back gives the English bank.
    setLang('en');
    expect(getBank('car', 'CA').byId.get('t.car.row.1')!.prompt).toBe(en.byId.get('t.car.row.1')!.prompt);
  });

  test('search ignores Spanish accents', () => {
    setLang('es');
    const bank = getBank('car', 'CA');
    expect(searchBank(bank, 'que debe').map(q => q.id)).toEqual(expect.arrayContaining(['t.car.row.1', 't.ca.1']));
  });

  test('lessons, state info and signs are translated', () => {
    setLang('es');
    expect(getLesson('t.lesson.signs')!.title).toBe('Prueba: Señales de tránsito');
    expect(getLesson('t.lesson.roadtest')!.title).toBe('Fixture: Road Test');
    const ca = getStateInfo('CA');
    expect(ca.facts[1].value).toBe('15 pies');
    expect(ca.facts[0].value).toBe('0.08%');
    expect(ca.notableLaws[0].title).toBe('Ley de prueba');
    expect(ca.facts[1].source.quote).toBe('fixture quote');
    expect(getSign('R1-1')!.name).toBe('Alto');
    // Display labels are translated; the English shape stays for the shape-clue logic.
    expect(getSign('R1-1')!.shapeLabel).toBe('octágono');
    expect(getSign('R1-1')!.shape).toBe('octagon');
    setLang('en');
    expect(getSign('R1-1')!.name).toBe('Stop');
    expect(getStateInfo('CA').facts[1].value).toBe('15 feet');
  });

  test('state names and UI strings follow the language', () => {
    const S = defineStrings({hello: 'Hello', count: (n: number) => `${n} questions`}, {hello: 'Hola', count: (n: number) => `${n} preguntas`});
    expect(tr(S).count(3)).toBe('3 questions');
    expect(stateName('NY')).toBe('New York');
    setLang('es');
    expect(tr(S).hello).toBe('Hola');
    expect(tr(S).count(3)).toBe('3 preguntas');
    expect(stateName('NY')).toBe('Nueva York');
    expect(stateName(null)).toBe('Tu estado');
    const names = stateList().map(s => s.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'es')));
    expect(names).toContain('Carolina del Norte');
  });
});
