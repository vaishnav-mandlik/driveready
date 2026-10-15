import React from 'react';
import {Text} from 'react-native';
import {fireEvent, screen} from '@testing-library/react-native';
import {ErrorBoundary} from '../../src/components/ErrorBoundary';
import {useSettings} from '../../src/store/settings';
import {renderWithProviders} from '../utils/render';

let explode = true;
function Flaky() {
  if (explode) {
    throw new Error('render failed');
  }
  return <Text>Recovered screen</Text>;
}

beforeEach(() => {
  explode = true;
  // React logs caught render errors; keep the test output clean.
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  (console.error as jest.Mock).mockRestore();
  useSettings.setState({language: 'en'});
});

test('a crashing screen shows the recovery screen, and "Try again" re-renders it', async () => {
  await renderWithProviders(
    <ErrorBoundary>
      <Flaky />
    </ErrorBoundary>,
  );
  expect(await screen.findByText('Something went wrong')).toBeTruthy();
  explode = false;
  await fireEvent.press(screen.getByTestId('error-retry'));
  expect(await screen.findByText('Recovered screen')).toBeTruthy();
});

test('"Go to Home" runs the reset callback before re-rendering', async () => {
  const onGoHome = jest.fn(() => {
    explode = false;
  });
  await renderWithProviders(
    <ErrorBoundary onGoHome={onGoHome}>
      <Flaky />
    </ErrorBoundary>,
  );
  await fireEvent.press(await screen.findByTestId('error-home'));
  expect(onGoHome).toHaveBeenCalledTimes(1);
  expect(await screen.findByText('Recovered screen')).toBeTruthy();
});

test('the recovery screen follows the app language', async () => {
  useSettings.setState({language: 'es'});
  await renderWithProviders(
    <ErrorBoundary>
      <Flaky />
    </ErrorBoundary>,
  );
  expect(await screen.findByText('Algo salió mal')).toBeTruthy();
  expect(screen.getByText('Intentar de nuevo')).toBeTruthy();
});
