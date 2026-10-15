import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, AppState, StatusBar, StyleSheet, useColorScheme, View} from 'react-native';
import {DarkTheme, DefaultTheme, NavigationContainer, NavigationState, Theme as NavTheme} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {applyInstalledContent, checkForContentUpdate} from './src/content/updates';
import {useHydrated} from './src/hooks/useLearner';
import {RootNavigator} from './src/navigation/RootNavigator';
import {checkAchievements} from './src/store/actions';
import {useSettings} from './src/store/settings';
import {ThemeProvider, useTheme} from './src/theme/ThemeProvider';

function Navigation() {
  const theme = useTheme();
  // Changing the language remounts every screen (so all text is re-read) on the same route stack.
  const language = useSettings(s => s.language);
  const navState = useRef<NavigationState | undefined>(undefined);
  const navTheme = useMemo<NavTheme>(() => {
    const base = theme.dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.danger,
      },
    };
  }, [theme]);

  useEffect(() => {
    // Streak/time-based achievements can unlock just by opening the app.
    checkAchievements();
  }, []);

  useEffect(() => {
    // Content updates: after the first screen is up, and whenever the app returns to the foreground.
    // The client rate-limits itself (once per 20 h) and is a no-op until CONTENT_BASE_URL is set.
    const timer = setTimeout(() => checkForContentUpdate(), 5000);
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') {
        checkForContentUpdate();
      }
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, []);

  return (
    <NavigationContainer
      key={language}
      theme={navTheme}
      initialState={navState.current}
      onStateChange={state => {
        navState.current = state;
      }}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

let contentApplied: Promise<void> | null = null;

/** Installed content updates are applied once per launch, before the first screen renders. */
function useContentReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    contentApplied ??= applyInstalledContent();
    contentApplied.finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}

function Boot() {
  const hydrated = useHydrated();
  const contentReady = useContentReady();
  const dark = useColorScheme() === 'dark';
  if (!hydrated || !contentReady) {
    return (
      <View style={[styles.boot, dark && styles.bootDark]}>
        <ActivityIndicator color={dark ? '#4C8DFF' : '#1F6FEB'} />
      </View>
    );
  }
  return (
    <ThemeProvider>
      <Navigation />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Boot />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F6FB'},
  bootDark: {backgroundColor: '#090E1A'},
});
