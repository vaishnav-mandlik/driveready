import React from 'react';
import {render, screen} from '@testing-library/react-native';
import App from '../App';
import {useSettings} from '../src/store/settings';

jest.mock('../src/content', () => require('./fixtures/content'));

test('renders onboarding for a new user', async () => {
  await render(<App />);
  expect(await screen.findByText(/welcome/i)).toBeTruthy();
});

test('renders the main tabs once onboarded', async () => {
  useSettings.setState({onboarded: true, state: 'CA', track: 'car'});
  await render(<App />);
  expect((await screen.findAllByText('Home')).length).toBeGreaterThan(0);
});

test('completing onboarding lands on Home (not a leftover onboarding screen)', async () => {
  const {fireEvent} = require('@testing-library/react-native');
  useSettings.setState({onboarded: false, state: null});
  await render(<App />);
  await fireEvent.press(await screen.findByTestId('welcome-start'));
  await fireEvent.press(await screen.findByTestId('state-CA'));
  await fireEvent.press(await screen.findByTestId('track-car'));
  await fireEvent.press(await screen.findByTestId('goal-save'));
  expect(await screen.findByTestId('home-exam')).toBeTruthy();
  expect(screen.queryByText('Set your goal')).toBeNull();
});
