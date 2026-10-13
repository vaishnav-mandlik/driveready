export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  elevated: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  onPrimary: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  accent: string;
  accentSoft: string;
  gold: string;
  goldSoft: string;
  overlay: string;
  shadow: string;
  /** Distinct hues for topic icons/charts; index with topicHue(). */
  hues: string[];
}

export const lightPalette: Palette = {
  background: '#F4F6FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EDF1F7',
  elevated: '#FFFFFF',
  border: '#E1E7F0',
  text: '#0D1626',
  textMuted: '#55657C',
  textFaint: '#8795AA',
  primary: '#1F6FEB',
  primaryPressed: '#1859C2',
  primarySoft: '#E2EDFF',
  onPrimary: '#FFFFFF',
  success: '#11994B',
  successSoft: '#DCF5E6',
  danger: '#E03E45',
  dangerSoft: '#FDE4E5',
  warning: '#E8930C',
  warningSoft: '#FFF1D6',
  accent: '#7A3FF0',
  accentSoft: '#EEE6FF',
  gold: '#D79A00',
  goldSoft: '#FFF4CC',
  overlay: 'rgba(8, 14, 28, 0.55)',
  shadow: '#0B1A33',
  hues: ['#1F6FEB', '#11994B', '#E8930C', '#7A3FF0', '#E03E45', '#0E9FB8', '#D9468F', '#5A6B85'],
};

export const darkPalette: Palette = {
  background: '#090E1A',
  surface: '#111A2B',
  surfaceAlt: '#18233A',
  elevated: '#1A2540',
  border: '#24324D',
  text: '#E9EEF7',
  textMuted: '#9DABC2',
  textFaint: '#6C7C96',
  primary: '#4C8DFF',
  primaryPressed: '#3B78E6',
  primarySoft: '#15284D',
  onPrimary: '#FFFFFF',
  success: '#2FCB72',
  successSoft: '#0E2C1E',
  danger: '#FF646B',
  dangerSoft: '#3A1519',
  warning: '#FFB43D',
  warningSoft: '#3A2A0E',
  accent: '#A88BFF',
  accentSoft: '#2A1F4D',
  gold: '#FFC53D',
  goldSoft: '#3A2E0A',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: '#000000',
  hues: ['#4C8DFF', '#2FCB72', '#FFB43D', '#A88BFF', '#FF646B', '#2CC4DB', '#F06AAE', '#8A9AB5'],
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'captionStrong'
  | 'label'
  | 'button';

interface VariantSpec {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  letterSpacing?: number;
  textTransform?: 'uppercase';
}

export const typeScale: Record<TextVariant, VariantSpec> = {
  display: {fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.6},
  title: {fontSize: 26, lineHeight: 32, fontWeight: '800', letterSpacing: -0.4},
  heading: {fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.2},
  subheading: {fontSize: 17, lineHeight: 23, fontWeight: '600'},
  body: {fontSize: 16, lineHeight: 23, fontWeight: '400'},
  bodyStrong: {fontSize: 16, lineHeight: 23, fontWeight: '600'},
  caption: {fontSize: 13, lineHeight: 18, fontWeight: '400'},
  captionStrong: {fontSize: 13, lineHeight: 18, fontWeight: '600'},
  label: {fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase'},
  button: {fontSize: 16, lineHeight: 20, fontWeight: '700'},
};
