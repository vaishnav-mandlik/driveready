import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import App from '../../App';
import {mockNav, renderWithProviders, setLearner} from '../utils/render';
import {useProgress} from '../../src/store/progress';
import {useSettings} from '../../src/store/settings';
import {clearBankCache} from '../../src/data/bank';

jest.mock('../../src/content', () => require('../fixtures/content'));
jest.setTimeout(60000);

import {CASES} from '../utils/screenCases';

/** Accents, ¿¡ or common Spanish function words. */
const SPANISH = /[áéíóúñ¿¡]|\b(de|la|el|tu|para|con|las|los|una?)\b/i;

/** Every string rendered as text (not accessibility labels). */
function renderedText(): string {
  const out: string[] = [];
  const walk = (n: unknown): void => {
    if (typeof n === 'string') {
      out.push(n);
    } else if (Array.isArray(n)) {
      n.forEach(walk);
    } else if (n && typeof n === 'object' && 'children' in n) {
      walk((n as {children: unknown}).children);
    }
  };
  walk(screen.toJSON());
  return out.join(' | ');
}

beforeEach(() => {
  clearBankCache();
  useProgress.getState().resetProgress();
  setLearner({language: 'es'});
});
afterAll(() => useSettings.setState({language: 'en'}));

describe('every screen renders in Spanish', () => {
  test.each(CASES)('%s', async (_name, Screen, params, english) => {
    await renderWithProviders(<Screen {...mockNav(params)} />);
    const text = renderedText();
    expect(text).toMatch(SPANISH);
    // The English phrase the English test looks for must be translated.
    expect(text).not.toMatch(english);
  });
});

test('the Welcome toggle switches the app to Spanish and back', async () => {
  useSettings.setState({onboarded: false, state: null, language: 'en'});
  await render(<App />);
  expect(await screen.findByText('Welcome to DriveReady')).toBeTruthy();
  await fireEvent.press(screen.getByText('Español'));
  expect(await screen.findByText('Bienvenido a DriveReady')).toBeTruthy();
  expect(screen.getByText('Comenzar')).toBeTruthy();
  await fireEvent.press(screen.getByText('English'));
  expect(await screen.findByText('Welcome to DriveReady')).toBeTruthy();
});

test('main tabs are labeled in Spanish', async () => {
  useSettings.setState({onboarded: true, state: 'CA', track: 'car', language: 'es'});
  await render(<App />);
  expect((await screen.findAllByText('Inicio')).length).toBeGreaterThan(0);
  expect(screen.queryByText('Home')).toBeNull();
});
