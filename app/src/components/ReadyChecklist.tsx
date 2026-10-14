import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {testReadyChecklist} from '../engine/checklist';
import {useLearner, useReadiness} from '../hooks/useLearner';
import {useProgress} from '../store/progress';
import {useTheme} from '../theme/ThemeProvider';
import {Card} from './Card';
import {Icon} from './Icon';
import {ProgressBar} from './Progress';
import {Text} from './Text';

/** "Ready for your test?" checklist card (Home + Progress). */
export function ReadyChecklist({compact = false}: {compact?: boolean}) {
  const {colors, spacing} = useTheme();
  const {bank, stateInfo, track, state} = useLearner();
  const readiness = useReadiness();
  const stats = useProgress(s => s.stats);
  const exams = useProgress(s => s.exams);
  const levels = useProgress(s => s.signLevels);
  const items = useMemo(
    () => testReadyChecklist({bank, stats, exams, readiness, facts: stateInfo.facts, levels, track, state}),
    [bank, stats, exams, readiness, stateInfo, levels, track, state],
  );
  const done = items.filter(i => i.done).length;
  const allDone = items.length > 0 && done === items.length;

  return (
    <Card variant={allDone ? 'tinted' : 'default'} tint={colors.successSoft} accessibilityLabel={`Test-ready checklist: ${done} of ${items.length} complete`}>
      <View style={[styles.row, {gap: spacing.sm}]}>
        <Icon name={allDone ? 'badge-check' : 'list-checks'} color={allDone ? colors.success : colors.primary} />
        <Text variant="subheading" style={styles.flex}>
          {allDone ? 'You’re ready for your test!' : 'Ready for your test?'}
        </Text>
        <Text variant="captionStrong" color="textMuted">
          {done}/{items.length}
        </Text>
      </View>
      {!compact || !allDone ? (
        <View style={{gap: spacing.md, marginTop: spacing.md}}>
          {items.map(item => (
            <View key={item.id} style={{gap: 6}}>
              <View style={[styles.row, {gap: spacing.sm}]}>
                <Icon name={item.done ? 'circle-check' : 'circle-dot'} size={18} color={item.done ? colors.success : colors.textFaint} />
                <Text variant="body" color={item.done ? 'textMuted' : 'text'} style={styles.flex}>
                  {item.label}
                </Text>
                <Text variant="captionStrong" color={item.done ? 'success' : 'textMuted'}>
                  {item.progress}
                </Text>
              </View>
              {!item.done ? <ProgressBar value={item.ratio} height={4} style={{marginLeft: 26}} /> : null}
            </View>
          ))}
        </View>
      ) : null}
      {allDone ? (
        <Text variant="caption" color="textMuted" style={{marginTop: spacing.sm}}>
          Keep doing a few questions a day until test day to stay sharp.
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
});
