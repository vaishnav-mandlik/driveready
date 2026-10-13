import React from 'react';
import {Pressable, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {haptic} from '../native';
import {useTheme} from '../theme/ThemeProvider';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  /** 'default' = surface with soft shadow, 'outlined' = border only, 'tinted' = colored background. */
  variant?: 'default' | 'outlined' | 'tinted';
  /** Background for 'tinted' cards (any color). */
  tint?: string;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function Card({
  children,
  onPress,
  onLongPress,
  variant = 'default',
  tint,
  padded = true,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: CardProps) {
  const {colors, radius, spacing, dark} = useTheme();
  const base: ViewStyle = {
    borderRadius: radius.lg,
    padding: padded ? spacing.lg : 0,
    backgroundColor: variant === 'tinted' ? tint ?? colors.primarySoft : colors.surface,
    borderWidth: variant === 'outlined' || (variant === 'default' && dark) ? StyleSheet.hairlineWidth * 2 : 0,
    borderColor: colors.border,
  };
  const shadow: ViewStyle | null =
    variant === 'default' && !dark
      ? {
          shadowColor: colors.shadow,
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: {width: 0, height: 4},
          elevation: 2,
        }
      : null;

  if (!onPress && !onLongPress) {
    return (
      <View style={[base, shadow, style]} testID={testID} accessibilityLabel={accessibilityLabel}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      onPress={() => {
        haptic('tap');
        onPress?.();
      }}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      testID={testID}
      android_ripple={{color: colors.border, borderless: false}}
      style={({pressed}) => [base, shadow, styles.clip, pressed && styles.pressed, style]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clip: {overflow: 'hidden'},
  pressed: {opacity: 0.92, transform: [{scale: 0.985}]},
});
