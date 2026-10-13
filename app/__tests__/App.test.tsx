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
