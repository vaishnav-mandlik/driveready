import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {useTheme} from '../theme/ThemeProvider';

const clamp01 = (v: number) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));

export interface ProgressBarProps {
  /** 0–1 */
  value: number;
  color?: string;
  trackColor?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function ProgressBar({value, color, trackColor, height = 8, style, accessibilityLabel}: ProgressBarProps) {
  const {colors} = useTheme();
  const anim = useRef(new Animated.Value(clamp01(value))).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamp01(value),
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [anim, value]);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{min: 0, max: 100, now: Math.round(clamp01(value) * 100)}}
      style={[{height, borderRadius: height / 2, backgroundColor: trackColor ?? colors.surfaceAlt}, styles.track, style]}>
      <Animated.View
        style={{
          height,
          borderRadius: height / 2,
          backgroundColor: color ?? colors.primary,
          width: anim.interpolate({inputRange: [0, 1], outputRange: ['0%', '100%']}),
        }}
      />
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
  /** 0–1 */
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function ProgressRing({value, size = 120, stroke = 10, color, trackColor, children, style, accessibilityLabel}: ProgressRingProps) {
  const {colors} = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamp01(value),
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [anim, value]);
  const offset = anim.interpolate({inputRange: [0, 1], outputRange: [c, 0]});
  return (
    <View
      style={[{width: size, height: size}, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{min: 0, max: 100, now: Math.round(clamp01(value) * 100)}}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor ?? colors.surfaceAlt} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? colors.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children ? <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {overflow: 'hidden', width: '100%'},
  center: {alignItems: 'center', justifyContent: 'center'},
});
