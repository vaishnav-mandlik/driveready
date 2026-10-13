import React, {useCallback} from 'react';
import {Alert, Linking, Pressable, StyleSheet, View} from 'react-native';
import {Icon, IconName} from '../Icon';
import {Text} from '../Text';
import type {Question} from '../../data/types';
import {haptic, speech} from '../../native';
import {useProgress} from '../../store/progress';
import {useTheme} from '../../theme/ThemeProvider';
import {reportMailto, speechTextFor, SUPPORT_EMAIL} from './helpers';

type ToolTone = 'primary' | 'warning';

/** Round icon button used in the question toolbar; supports a toggled ("active") state. */
export function ToolButton({
  icon,
  label,
  onPress,
  active = false,
  tone = 'primary',
  testID,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  active?: boolean;
  tone?: ToolTone;
  testID?: string;
}) {
  const {colors} = useTheme();
  const activeFg = tone === 'warning' ? colors.warning : colors.primary;
  const activeBg = tone === 'warning' ? colors.warningSoft : colors.primarySoft;
  return (
    <Pressable
      onPress={() => {
        haptic('selection');
        onPress();
      }}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{selected: active}}
      testID={testID}
      style={({pressed}) => [
        styles.tool,
        {backgroundColor: active ? activeBg : colors.surfaceAlt},
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} size={20} color={active ? activeFg : colors.textMuted} fill={active ? activeBg : undefined} />
    </Pressable>
  );
}

/** Save / unsave a question (persisted bookmarks). Subscribes only to its own question. */
export function BookmarkButton({questionId}: {questionId: string}) {
  const saved = useProgress(s => !!s.bookmarks[questionId]);
  const toggle = useProgress(s => s.toggleBookmark);
  return (
    <ToolButton
      icon={saved ? 'bookmark-check' : 'bookmark'}
      label={saved ? 'Remove from saved questions' : 'Save question'}
      active={saved}
      onPress={() => toggle(questionId)}
      testID="bookmark-button"
    />
  );
}

/** Reads the question (and, once revealed, the answer + explanation) with the device voice. */
export function ReadAloudButton({
  question,
  order,
  revealed,
}: {
  question: Question;
  order?: readonly number[] | null;
  revealed: boolean;
}) {
  const onPress = useCallback(() => {
    speech.stop();
    speech.speak(speechTextFor(question, order, revealed));
  }, [question, order, revealed]);
  return <ToolButton icon="volume" label="Read question aloud" onPress={onPress} testID="read-aloud-button" />;
}

/** Exam mode: mark a question to come back to before submitting. */
export function FlagButton({flagged, onToggle}: {flagged: boolean; onToggle: () => void}) {
  return (
    <ToolButton
      icon="flag"
      tone="warning"
      label={flagged ? 'Remove review flag' : 'Flag for review'}
      active={flagged}
      onPress={onToggle}
      testID="flag-button"
    />
  );
}

export async function openReport(question: Question): Promise<void> {
  try {
    await Linking.openURL(reportMailto(question));
  } catch {
    Alert.alert(
      'No email app found',
      `Email ${SUPPORT_EMAIL} and include question ID ${question.id}. Thanks for helping us improve!`,
    );
  }
}

/** Small "Report a problem" text link (opens an email with the question id). */
export function ReportLink({question}: {question: Question}) {
  const {spacing} = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptic('selection');
        openReport(question);
      }}
      hitSlop={10}
      accessibilityRole="link"
      accessibilityLabel="Report a problem with this question"
      accessibilityHint="Opens your email app"
      style={({pressed}) => [styles.report, {gap: spacing.xs, paddingVertical: spacing.xs}, pressed && styles.pressed]}>
      <Icon name="alert" size={14} color="textFaint" />
      <Text variant="caption" color="textFaint">
        Report a problem
      </Text>
    </Pressable>
  );
}

/** Bookmark + read-aloud (+ optional flag) row shown at the top-right of a question. */
export function QuestionTools({
  question,
  order,
  revealed,
  flagged,
  onToggleFlag,
}: {
  question: Question;
  order?: readonly number[] | null;
  revealed: boolean;
  flagged?: boolean;
  onToggleFlag?: () => void;
}) {
  const {spacing} = useTheme();
  return (
    <View style={[styles.tools, {gap: spacing.sm}]}>
      {onToggleFlag ? <FlagButton flagged={!!flagged} onToggle={onToggleFlag} /> : null}
      <BookmarkButton questionId={question.id} />
      <ReadAloudButton question={question} order={order} revealed={revealed} />
    </View>
  );
}

const styles = StyleSheet.create({
  tool: {width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  pressed: {opacity: 0.7},
  tools: {flexDirection: 'row', alignItems: 'center'},
  report: {flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start'},
});
