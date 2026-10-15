import {sourceLabel} from '../../src/screens/learn/sourceLabel';
import {useSettings} from '../../src/store/settings';

const HANDBOOK = 'https://dmv.example.gov/driver-handbook.pdf';

afterEach(() => useSettings.setState({language: 'en'}));

test('only the state handbook is cited as "Handbook p. N"', () => {
  expect(sourceLabel({url: HANDBOOK, page: 42, quote: 'q'}, HANDBOOK)).toBe('Handbook p. 42');
});

test('other official PDFs (statute compilations, motorcycle manuals) are not called the handbook', () => {
  expect(sourceLabel({url: 'https://ardot.gov/laws-2025.pdf', page: 800, quote: 'q'}, HANDBOOK)).toBe('Official document p. 800');
});

test('statute web pages show as an official website, never with a fake handbook page', () => {
  // Facts verified against a statute keep the page of the research text file; it must not leak.
  expect(sourceLabel({url: 'https://legislature.idaho.gov/statutesrules/idstat/title49/t49ch14/sect49-1401a/', page: 1, quote: 'q'}, HANDBOOK)).toBe('Official website');
  expect(sourceLabel({url: 'https://dmv.example.gov/page', page: null, quote: 'q'}, HANDBOOK)).toBe('Official website');
});

test('labels follow the app language', () => {
  useSettings.setState({language: 'es'});
  expect(sourceLabel({url: HANDBOOK, page: 7, quote: 'q'}, HANDBOOK)).toBe('Manual, pág. 7');
});
