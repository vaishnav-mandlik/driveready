import React from 'react';
import {StyleSheet, Text as RNText, TextProps as RNTextProps} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {Palette, TextVariant, typeScale} from '../theme/tokens';

export type TextColor =
  | 'text'
  | 'textMuted'
  | 'textFaint'
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'accent'
  | 'gold'
  | 'onPrimary';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  /** Theme color key or a literal color. */
  color?: TextColor | (string & {});
  align?: 'left' | 'center' | 'right';
  /** Override the variant's weight. */
  weight?: '400' | '500' | '600' | '700' | '800';
}

/** Themed text that follows the app's type scale and the user's text-size setting. */
export function Text({variant = 'body', color = 'text', align, weight, style, children, ...rest}: TextProps) {
  const {colors, textScale} = useTheme();
  const spec = typeScale[variant];
  const resolved = (colors as unknown as Record<keyof Palette, string>)[color as keyof Palette] ?? color;
  return (
    <RNText
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={[
        {
          fontSize: spec.fontSize * textScale,
          lineHeight: spec.lineHeight * textScale,
          fontWeight: weight ?? spec.fontWeight,
          letterSpacing: spec.letterSpacing,
          textTransform: spec.textTransform,
          color: resolved,
          textAlign: align,
        },
        styles.base,
        style,
      ]}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {includeFontPadding: false},
});
