import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {Icon} from './Icon';
import {Text} from './Text';

export type ChoiceState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'missed' | 'dimmed';

export interface ChoiceButtonProps {
  label: string;
  /** "A", "B", ... */
  letter: string;
  /**
   * idle: not answered · selected: chosen, no feedback yet (exam mode) ·
   * correct: right answer (chosen or revealed) · incorrect: chosen and wrong ·
   * missed: the right answer the user didn't pick · dimmed: other options after answering.
   */
  state: ChoiceState;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

export function ChoiceButton({label, letter, state, onPress, disabled, testID}: ChoiceButtonProps) {
  const {colors, radius, spacing} = useTheme();
  const shake = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'incorrect') {
      Animated.sequence([
        Animated.timing(shake, {toValue: 1, duration: 60, useNativeDriver: true}),
        Animated.timing(shake, {toValue: -1, duration: 60, useNativeDriver: true}),
        Animated.timing(shake, {toValue: 1, duration: 60, useNativeDriver: true}),
        Animated.timing(shake, {toValue: 0, duration: 60, useNativeDriver: true}),
      ]).start();
    } else if (state === 'correct') {
      Animated.sequence([
        Animated.timing(pop, {toValue: 1.03, duration: 110, useNativeDriver: true}),
        Animated.spring(pop, {toValue: 1, friction: 4, useNativeDriver: true}),
      ]).start();
    }
  }, [state, shake, pop]);

  const palette = {
    idle: {bg: colors.surface, border: colors.border, fg: colors.text, letterBg: colors.surfaceAlt, letterFg: colors.textMuted},
    selected: {bg: colors.primarySoft, border: colors.primary, fg: colors.text, letterBg: colors.primary, letterFg: colors.onPrimary},
    correct: {bg: colors.successSoft, border: colors.success, fg: colors.text, letterBg: colors.success, letterFg: '#FFFFFF'},
    missed: {bg: colors.successSoft, border: colors.success, fg: colors.text, letterBg: colors.success, letterFg: '#FFFFFF'},
    incorrect: {bg: colors.dangerSoft, border: colors.danger, fg: colors.text, letterBg: colors.danger, letterFg: '#FFFFFF'},
    dimmed: {bg: colors.surface, border: colors.border, fg: colors.textMuted, letterBg: colors.surfaceAlt, letterFg: colors.textFaint},
  }[state];

  const stateLabel =
    state === 'correct' ? ', correct answer' : state === 'missed' ? ', correct answer' : state === 'incorrect' ? ', your answer, incorrect' : state === 'selected' ? ', selected' : '';

  return (
    <Animated.View
      style={{
        transform: [{translateX: shake.interpolate({inputRange: [-1, 1], outputRange: [-8, 8]})}, {scale: pop}],
      }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`Option ${letter}: ${label}${stateLabel}`}
        accessibilityState={{disabled: !!disabled, selected: state === 'selected'}}
        style={({pressed}) => [
          styles.base,
          {
            backgroundColor: palette.bg,
            borderColor: palette.border,
            borderRadius: radius.lg,
            padding: spacing.md,
            gap: spacing.md,
          },
          pressed && !disabled && {transform: [{scale: 0.985}], backgroundColor: colors.surfaceAlt},
        ]}>
        <View style={[styles.letter, {backgroundColor: palette.letterBg}]}>
          {state === 'correct' || state === 'missed' ? (
            <Icon name="check" size={16} color="#FFFFFF" strokeWidth={3} />
          ) : state === 'incorrect' ? (
            <Icon name="x" size={16} color="#FFFFFF" strokeWidth={3} />
          ) : (
            <Text variant="captionStrong" color={palette.letterFg}>
              {letter}
            </Text>
          )}
        </View>
        <Text variant="body" color={palette.fg} style={styles.label}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, minHeight: 56},
  letter: {width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center'},
  label: {flex: 1},
});
