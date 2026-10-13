import React from 'react';
import {ActivityIndicator, Pressable, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {haptic} from '../native';
import {useTheme} from '../theme/ThemeProvider';
import {Icon, IconName} from './Icon';
import {Text} from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled,
  loading,
  fullWidth,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const {colors, radius} = useTheme();
  const palette: Record<ButtonVariant, {bg: string; fg: string; border?: string; pressed: string}> = {
    primary: {bg: colors.primary, fg: colors.onPrimary, pressed: colors.primaryPressed},
    secondary: {bg: colors.primarySoft, fg: colors.primary, pressed: colors.surfaceAlt},
    outline: {bg: 'transparent', fg: colors.text, border: colors.border, pressed: colors.surfaceAlt},
    ghost: {bg: 'transparent', fg: colors.primary, pressed: colors.surfaceAlt},
    danger: {bg: colors.danger, fg: '#FFFFFF', pressed: colors.danger},
    success: {bg: colors.success, fg: '#FFFFFF', pressed: colors.success},
  };
  const p = palette[variant];
  const height = size === 'sm' ? 38 : size === 'lg' ? 56 : 48;
  const iconSize = size === 'sm' ? 16 : 20;
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={() => {
        haptic('tap');
        onPress();
      }}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{disabled: !!inactive, busy: !!loading}}
      testID={testID}
      style={({pressed}) => [
        styles.base,
        {
          minHeight: height,
          borderRadius: radius.md,
          backgroundColor: pressed ? p.pressed : p.bg,
          borderColor: p.border ?? 'transparent',
          borderWidth: p.border ? 1.5 : 0,
          paddingHorizontal: size === 'sm' ? 14 : 20,
          opacity: inactive ? 0.5 : 1,
        },
        fullWidth && styles.full,
        pressed && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={iconSize} color={p.fg} /> : null}
          <Text variant={size === 'sm' ? 'captionStrong' : 'button'} color={p.fg} numberOfLines={1}>
            {title}
          </Text>
          {iconRight ? <Icon name={iconRight} size={iconSize} color={p.fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}

export interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  color?: string;
  background?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function IconButton({icon, onPress, accessibilityLabel, size = 22, color, background, disabled, style, testID}: IconButtonProps) {
  const {colors} = useTheme();
  const dim = size + 22;
  return (
    <Pressable
      onPress={() => {
        haptic('selection');
        onPress();
      }}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={({pressed}) => [
        styles.iconBtn,
        {width: dim, height: dim, borderRadius: dim / 2, backgroundColor: background ?? 'transparent', opacity: disabled ? 0.4 : 1},
        pressed && {backgroundColor: colors.surfaceAlt},
        style,
      ]}>
      <Icon name={icon} size={size} color={color ?? colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {alignItems: 'center', justifyContent: 'center'},
  full: {alignSelf: 'stretch'},
  row: {flexDirection: 'row', alignItems: 'center', gap: 8},
  pressed: {transform: [{scale: 0.98}]},
  iconBtn: {alignItems: 'center', justifyContent: 'center'},
});
