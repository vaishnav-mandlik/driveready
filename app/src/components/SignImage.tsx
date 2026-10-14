import React, {memo} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {getSign} from '../data/signs';
import {useTheme} from '../theme/ThemeProvider';
import {Icon} from './Icon';

export interface SignImageProps {
  code: string;
  /** Rendered width of the longest side, in dp. */
  size?: number;
  style?: StyleProp<ViewStyle>;
  /** Defaults to the sign's name. Pass '' to hide it from screen readers (e.g. inside a quiz where it would reveal the answer). */
  accessibilityLabel?: string;
}

/** Renders a road sign / signal / marking from the bundled vector registry. */
export const SignImage = memo(function SignImage({code, size = 140, style, accessibilityLabel}: SignImageProps) {
  const {colors, radius} = useTheme();
  const sign = getSign(code);
  if (!sign) {
    return (
      <View style={[styles.missing, {width: size, height: size, borderRadius: radius.md, backgroundColor: colors.surfaceAlt}, style]}>
        <Icon name="signpost" size={size * 0.4} color="textFaint" />
      </View>
    );
  }
  const w = sign.aspect >= 1 ? size : size * sign.aspect;
  const h = sign.aspect >= 1 ? size / sign.aspect : size;
  const label = accessibilityLabel ?? (sign.category === 'scenario' ? `Picture: ${sign.meaning}` : `${sign.name} sign`);
  return (
    <View
      style={[{width: w, height: h}, style]}
      accessible={label !== ''}
      accessibilityRole={label !== '' ? 'image' : undefined}
      accessibilityLabel={label || undefined}
      importantForAccessibility={label === '' ? 'no-hide-descendants' : 'auto'}>
      <SvgXml xml={sign.xml} width={w} height={h} />
    </View>
  );
});

const styles = StyleSheet.create({
  missing: {alignItems: 'center', justifyContent: 'center'},
});
