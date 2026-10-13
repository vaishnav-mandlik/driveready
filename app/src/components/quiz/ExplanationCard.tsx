import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon, IconName} from '../Icon';
import {Text} from '../Text';
import type {Question} from '../../data/types';
import {useTheme} from '../../theme/ThemeProvider';
import {correctAnswerText, Verdict, verdictFor} from './helpers';

export interface ExplanationCardProps {
  question: Question;
  /** ORIGINAL index the learner picked (null = not answered / just revealed). */
  chosen: number | null | undefined;
  /** Display order, so "The answer is B" matches what the learner saw. */
  order?: readonly number[] | null;
  /** Rotates the encouraging headline so it doesn't feel canned. */
  seed?: number;
}

const CORRECT_TITLES = ['Correct!', 'Nice work!', 'Exactly right', 'You got it'];
const WRONG_TITLES = ['Not quite', 'Good try', 'Almost'];

/** Feedback after answering: verdict, the right answer (when missed), why, and the handbook ref. */
export function ExplanationCard({question, chosen, order, seed = 0}: ExplanationCardProps) {
  const {colors, radius, spacing} = useTheme();
  const verdict: Verdict = verdictFor(question, chosen);
  const look: Record<Verdict, {bg: string; fg: string; icon: IconName; title: string}> = {
    correct: {
      bg: colors.successSoft,
      fg: colors.success,
      icon: 'circle-check',
      title: CORRECT_TITLES[Math.abs(seed) % CORRECT_TITLES.length],
    },
    incorrect: {
      bg: colors.dangerSoft,
      fg: colors.danger,
      icon: 'circle-x',
      title: WRONG_TITLES[Math.abs(seed) % WRONG_TITLES.length],
    },
    unanswered: {bg: colors.primarySoft, fg: colors.primary, icon: 'lightbulb', title: 'Explanation'},
  };
  const l = look[verdict];

  return (
    <View
      testID="explanation-card"
      accessibilityRole="summary"
      style={[styles.card, {backgroundColor: l.bg, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm}]}>
      <View style={[styles.row, {gap: spacing.sm}]}>
        <Icon name={l.icon} size={22} color={l.fg} />
        <Text variant="subheading" color={l.fg} accessibilityRole="header">
          {l.title}
        </Text>
      </View>
      {verdict !== 'correct' ? (
        <Text variant="bodyStrong">The correct answer is {correctAnswerText(question, order)}</Text>
      ) : null}
      <Text variant="body">{question.explanation}</Text>
      {question.ref ? (
        <View style={[styles.row, {gap: spacing.xs}]}>
          <Icon name="book" size={14} color="textMuted" />
          <Text variant="caption" color="textMuted" style={styles.flex}>
            {question.ref}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
  row: {flexDirection: 'row', alignItems: 'center'},
  flex: {flex: 1},
});
