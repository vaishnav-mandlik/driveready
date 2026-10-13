import React, {useEffect, useMemo, useRef} from 'react';
import {AccessibilityInfo, Animated, Dimensions, Easing, StyleSheet, View} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';

const PIECES = 36;

/** One-shot celebratory confetti burst (skipped when Reduce Motion is on). */
export function Confetti({run}: {run: boolean}) {
  const {colors} = useTheme();
  const {width, height} = Dimensions.get('window');
  const progress = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = React.useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  const pieces = useMemo(() => {
    const palette = [colors.primary, colors.success, colors.warning, colors.accent, colors.danger, colors.gold];
    return Array.from({length: PIECES}, (_, i) => {
      // deterministic pseudo-random spread per piece
      const r1 = ((i * 9301 + 49297) % 233280) / 233280;
      const r2 = ((i * 4096 + 150889) % 714025) / 714025;
      return {
        x: r1 * width,
        drift: (r2 - 0.5) * 160,
        delay: r2 * 0.25,
        size: 6 + r1 * 6,
        rotate: (r1 * 720 - 360).toFixed(0) + 'deg',
        color: palette[i % palette.length],
      };
    });
  }, [colors, width]);

  useEffect(() => {
    if (run && !reduceMotion) {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 2200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [run, reduceMotion, progress]);

  if (!run || reduceMotion) {
    return null;
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => {
        const t = progress.interpolate({inputRange: [p.delay, 1], outputRange: [0, 1], extrapolate: 'clamp'});
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: -20,
              width: p.size,
              height: p.size * 1.6,
              borderRadius: 2,
              backgroundColor: p.color,
              opacity: t.interpolate({inputRange: [0, 0.8, 1], outputRange: [1, 1, 0]}),
              transform: [
                {translateY: t.interpolate({inputRange: [0, 1], outputRange: [0, height * 0.9]})},
                {translateX: t.interpolate({inputRange: [0, 1], outputRange: [0, p.drift]})},
                {rotate: t.interpolate({inputRange: [0, 1], outputRange: ['0deg', p.rotate]})},
              ],
            }}
          />
        );
      })}
    </View>
  );
}
