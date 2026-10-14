import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon, IconName} from '../Icon';
import {Text} from '../Text';
import type {Question} from '../../data/types';
import {defineStrings, useStrings} from '../../i18n';
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

const STR = defineStrings(
  {
    correctTitles: ['Correct!', 'Nice work!', 'Exactly right', 'You got it'],
    wrongTitles: ['Not quite', 'Good try', 'Almost'],
    explanation: 'Explanation',
    correctIs: (answer: string) => `The correct answer is ${answer}`,
  },
  {
    correctTitles: ['¡Correcto!', '¡Bien hecho!', 'Exacto', '¡Eso es!'],
    wrongTitles: ['No del todo', 'Buen intento', 'Casi'],
    explanation: 'Explicación',
    correctIs: (answer: string) => `La respuesta correcta es ${answer}`,
  },
);

/** Feedback after answering: verdict, the right answer (when missed), why, and the handbook ref. */
export function ExplanationCard({question, chosen, order, seed = 0}: ExplanationCardProps) {
  const {colors, radius, spacing} = useTheme();
  const t = useStrings(STR);
  const verdict: Verdict = verdictFor(question, chosen);
  const look: Record<Verdict, {bg: string; fg: string; icon: IconName; title: string}> = {
    correct: {
      bg: colors.successSoft,
      fg: colors.success,
      icon: 'circle-check',
      title: t.correctTitles[Math.abs(seed) % t.correctTitles.length],
    },
    incorrect: {
      bg: colors.dangerSoft,
      fg: colors.danger,
      icon: 'circle-x',
      title: t.wrongTitles[Math.abs(seed) % t.wrongTitles.length],
    },
    unanswered: {bg: colors.primarySoft, fg: colors.primary, icon: 'lightbulb', title: t.explanation},
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
        <Text variant="bodyStrong">{t.correctIs(correctAnswerText(question, order))}</Text>
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
