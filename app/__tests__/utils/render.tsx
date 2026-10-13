import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {render, RenderOptions} from '@testing-library/react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider} from '../../src/theme/ThemeProvider';
import {useSettings} from '../../src/store/settings';

/** Puts the learner into an onboarded state (California, car) unless overridden. */
export function setLearner(patch: Partial<ReturnType<typeof useSettings.getState>> = {}) {
  useSettings.setState({onboarded: true, state: 'CA', track: 'car', ...patch});
}

/** Minimal navigation/route props for rendering a screen component directly. */
export function mockNav<P extends object | undefined>(params?: P) {
  const navigation = {
    navigate: jest.fn(),
    push: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
    popToTop: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    removeListener: jest.fn(),
    canGoBack: jest.fn(() => true),
    getParent: jest.fn(() => undefined),
    dispatch: jest.fn(),
    isFocused: jest.fn(() => true),
  };
  const route = {key: 'test-route', name: 'Test', params};
  return {navigation: navigation as any, route: route as any};
}

/**
 * Render inside the app providers (theme, safe area, navigation container).
 * NOTE: @testing-library/react-native v14 — render() and fireEvent.*() return Promises: always `await` them.
 */
export async function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  return await render(
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>{ui}</NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>,
    options,
  );
}
