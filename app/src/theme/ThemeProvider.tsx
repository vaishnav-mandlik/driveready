import React, {createContext, useContext, useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {useSettings} from '../store/settings';
import {darkPalette, lightPalette, Palette, radius, spacing} from './tokens';

export interface Theme {
  dark: boolean;
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  /** User-chosen text size multiplier (Settings > Text size). */
  textScale: number;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const system = useColorScheme();
  const mode = useSettings(s => s.theme);
  const textScale = useSettings(s => s.textScale);
  const dark = mode === 'dark' || (mode === 'system' && system === 'dark');
  const value = useMemo<Theme>(
    () => ({
      dark,
      colors: dark ? darkPalette : lightPalette,
      spacing,
      radius,
      textScale,
    }),
    [dark, textScale],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const t = useContext(ThemeContext);
  if (!t) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return t;
}

/** Stable color for a topic/category index. */
export function hueAt(colors: Palette, index: number): string {
  return colors.hues[((index % colors.hues.length) + colors.hues.length) % colors.hues.length];
}
