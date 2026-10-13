import React, {memo, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Card} from '../Card';
import {ChoiceButton} from '../ChoiceButton';
import {SignImage} from '../SignImage';
import {Text} from '../Text';
import type {Question} from '../../data/types';
import {useTheme} from '../../theme/ThemeProvider';
import {ExplanationCard} from './ExplanationCard';
import {choiceStateFor, displayOrder, letterAt, signLabelFor} from './helpers';

export interface QuestionCardProps {
  question: Question;
  /** ORIGINAL choice indexes in display order (session.orders[i]); authored order if omitted. */
  order?: readonly number[] | null;
  /** ORIGINAL index the learner picked, or null. */
  chosen?: number | null;
  /** Show right/wrong states (and the explanation unless `showExplanation` is false). */
  revealed: boolean;
  /** Called with the ORIGINAL choice index. Omit for read-only cards. */
  onChoose?: (original: number) => void;
  /** Choices can't be pressed (answer locked, session over...). */
  locked?: boolean;
  showExplanation?: boolean;
  /** Left side of the row above the prompt (e.g. "Question 3", topic chip, status). */
  eyebrow?: React.ReactNode;
  /** Right side of that row (bookmark, read aloud, flag...). */
  tools?: React.ReactNode;
  /** Rendered after the explanation (e.g. "Report a problem"). */
  footer?: React.ReactNode;
  /** Wrap in a Card (lists, detail) or render flat (the quiz screen). */
  framed?: boolean;
  /** Smaller prompt + sign for long lists. */
  compact?: boolean;
  /** Varies the explanation headline. */
  explanationSeed?: number;
  testID?: string;
}

/**
 * One question: optional sign, prompt, choices (in the learner's display order)
 * and — once revealed — the explanation. Shared by Quiz, Review and QuestionDetail.
 */
export const QuestionCard = memo(function QuestionCard({
  question,
  order,
  chosen = null,
  revealed,
  onChoose,
  locked = false,
  showExplanation = true,
  eyebrow,
  tools,
  footer,
  framed = true,
  compact = false,
  explanationSeed,
  testID,
}: QuestionCardProps) {
  const {colors, radius, spacing} = useTheme();
  const shown = useMemo(() => displayOrder(question, order), [question, order]);
  const interactive = !!onChoose && !locked;

  const body = (
    <View style={{gap: spacing.lg}} testID={testID}>
      {eyebrow || tools ? (
        <View style={[styles.topRow, {gap: spacing.sm}]}>
          <View style={styles.eyebrow}>{eyebrow}</View>
          {tools}
        </View>
      ) : null}

      {question.sign ? (
        <View
          style={[
            styles.signBox,
            {backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: compact ? spacing.md : spacing.lg},
          ]}>
          <SignImage
            code={question.sign}
            size={compact ? 96 : 150}
            accessibilityLabel={signLabelFor(question, revealed)}
          />
        </View>
      ) : null}

      <Text variant={compact ? 'subheading' : 'heading'} accessibilityRole="header">
        {question.prompt}
      </Text>

      <View style={{gap: spacing.md}}>
        {shown.map((original, pos) => (
          <ChoiceButton
            key={original}
            letter={letterAt(pos)}
            label={question.choices[original]}
            state={choiceStateFor(original, {answer: question.answer, chosen, revealed})}
            onPress={() => onChoose?.(original)}
            disabled={!interactive}
            testID={`choice-${pos}`}
          />
        ))}
      </View>

      {revealed && showExplanation ? (
        <ExplanationCard question={question} chosen={chosen} order={shown} seed={explanationSeed} />
      ) : null}

      {footer}
    </View>
  );

  if (!framed) {
    return body;
  }
  return <Card>{body}</Card>;
});

const styles = StyleSheet.create({
  topRow: {flexDirection: 'row', alignItems: 'center'},
  eyebrow: {flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8},
  signBox: {alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch'},
});
