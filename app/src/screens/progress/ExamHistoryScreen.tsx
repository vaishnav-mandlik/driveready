import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {BarChart, Card, Chip, EmptyState, Icon, ProgressBar, Screen, Text} from '../../components';
import {getTopic} from '../../data/tracks';
import type {TopicId} from '../../data/types';
import {formatDuration} from '../../engine/dates';
import {useLearner} from '../../hooks/useLearner';
import type {RootScreenProps} from '../../navigation/types';
import {ExamRecord, useProgress} from '../../store/progress';
import {getSession} from '../../store/session';
import {useTheme} from '../../theme/ThemeProvider';

export function ExamHistoryScreen({navigation}: RootScreenProps<'ExamHistory'>) {
  const {colors, spacing} = useTheme();
  const {track} = useLearner();
  const all = useProgress(s => s.exams);
  const exams = useMemo(() => all.filter(e => e.track === track), [all, track]);
  const [open, setOpen] = useState<string | null>(null);
  const last10 = useMemo(() => exams.slice(0, 10).reverse(), [exams]);
  const passed = exams.filter(e => e.passed).length;

  return (
    <Screen scroll={false} padded={false}>
      <FlatList
        data={exams}
        keyExtractor={e => e.id}
        contentContainerStyle={{padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.huge}}
        ListHeaderComponent={
          exams.length ? (
            <Card style={{marginBottom: spacing.sm}}>
              <Text variant="bodyStrong">
                {passed} of {exams.length} passed
              </Text>
              <Text variant="caption" color="textMuted" style={{marginBottom: spacing.md}}>
                Score % of your last {last10.length} attempt{last10.length === 1 ? '' : 's'}
              </Text>
              <BarChart
                data={last10.map((e, i) => ({label: String(i + 1), value: Math.round((e.correct / Math.max(1, e.total)) * 100), highlight: e.passed}))}
                height={90}
                color={colors.success}
                accessibilityLabel="Recent exam scores"
              />
            </Card>
          ) : undefined
        }
        ListEmptyComponent={
          <EmptyState icon="clipboard-check" title="No exams yet" message="Exam simulations you finish will appear here with your score and weak topics." actionLabel="Take an exam" onAction={() => navigation.navigate('ExamIntro', {})} />
        }
        renderItem={({item}) => (
          <ExamRow
            exam={item}
            expanded={open === item.id}
            onToggle={() => setOpen(o => (o === item.id ? null : item.id))}
            onReview={getSession(item.id) ? () => navigation.navigate('Review', {sessionId: item.id}) : undefined}
          />
        )}
      />
    </Screen>
  );
}

function ExamRow({exam, expanded, onToggle, onReview}: {exam: ExamRecord; expanded: boolean; onToggle: () => void; onReview?: () => void}) {
  const {colors, spacing} = useTheme();
  const pct = Math.round((exam.correct / Math.max(1, exam.total)) * 100);
  const topics = (Object.entries(exam.byTopic) as [TopicId, [number, number]][]).filter(([, v]) => v && v[1] > 0).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]);
  return (
    <Card>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityLabel={`${exam.title}, ${pct} percent, ${exam.passed ? 'passed' : 'failed'}`} accessibilityHint="Shows topic breakdown">
        <View style={[styles.row, {gap: spacing.md}]}>
          <Icon name={exam.passed ? 'badge-check' : 'circle-x'} color={exam.passed ? colors.success : colors.danger} />
          <View style={styles.flex}>
            <Text variant="bodyStrong">
              {exam.correct}/{exam.total} · {pct}%
            </Text>
            <Text variant="caption" color="textMuted">
              {new Date(exam.at).toLocaleString()} · {formatDuration(exam.durationSec)}
            </Text>
          </View>
          <Chip label={exam.passed ? 'Passed' : 'Failed'} tone={exam.passed ? 'success' : 'danger'} />
          <Icon name={expanded ? 'chevron-up' : 'chevron-down'} color="textFaint" />
        </View>
      </Pressable>
      {expanded ? (
        <View style={{marginTop: spacing.md, gap: spacing.md}}>
          <Text variant="caption" color="textMuted">
            {exam.title} · {exam.passingScore} needed{exam.endedEarly ? ' · ended once decided' : ''}
            {exam.timedOut ? ' · time ran out' : ''}
          </Text>
          {topics.map(([topic, [c, n]]) => (
            <View key={topic} style={{gap: 4}}>
              <View style={styles.row}>
                <Text variant="caption" style={styles.flex}>
                  {getTopic(topic)?.title ?? topic}
                </Text>
                <Text variant="captionStrong">
                  {c}/{n}
                </Text>
              </View>
              <ProgressBar value={c / n} height={5} color={c / n >= 0.8 ? colors.success : c / n >= 0.6 ? colors.warning : colors.danger} />
            </View>
          ))}
          {onReview ? (
            <Text variant="captionStrong" color="primary" onPress={onReview} accessibilityRole="link">
              Review answers
            </Text>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
});
