import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {BarChart, Card, Chip, Divider, Icon, IconTile, LargeHeader, ListRow, ProgressRing, ReadyChecklist, Screen, SectionHeader, StatTile, Text} from '../../components';
import {getTopic} from '../../data/tracks';
import {ACHIEVEMENTS} from '../../engine/achievements';
import {formatDuration} from '../../engine/dates';
import {activitySeries, computeTotals} from '../../engine/stats';
import {useLearner, useReadiness} from '../../hooks/useLearner';
import type {TabScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {percent} from '../practice/shared/format';
import {useNow} from '../practice/shared/hooks';
import {MasteryBar} from '../practice/shared/ui';

export const TIER_COLORS = {bronze: '#C07A3B', silver: '#8D99AE', gold: '#E0A100'} as const;

export function ProgressScreen({navigation}: TabScreenProps<'Progress'>) {
  const {colors, spacing} = useTheme();
  const {trackMeta, track} = useLearner();
  const readiness = useReadiness();
  const now = useNow(navigation);
  const days = useProgress(s => s.days);
  const exams = useProgress(s => s.exams);
  const totalAnswered = useProgress(s => s.totalAnswered);
  const totalCorrect = useProgress(s => s.totalCorrect);
  const unlocked = useProgress(s => s.achievements);
  const totals = useMemo(() => computeTotals(days, exams, totalAnswered, totalCorrect, now), [days, exams, totalAnswered, totalCorrect, now]);
  const series = useMemo(() => activitySeries(days, 14, now), [days, now]);
  const trackExams = useMemo(() => exams.filter(e => e.track === track), [exams, track]);
  const unlockedList = ACHIEVEMENTS.filter(a => unlocked[a.id]);
  const topics = useMemo(() => [...readiness.topics].sort((a, b) => a.knowledge - b.knowledge), [readiness.topics]);

  return (
    <Screen edges={['top']}>
      <LargeHeader title="Progress" subtitle={trackMeta.title} />

      <View style={[styles.row, {gap: spacing.md}]}>
        <StatTile label="Answered" value={String(totals.answered)} icon="list-checks" tone="primary" />
        <StatTile label="Accuracy" value={percent(totals.accuracy)} icon="target" tone="success" />
      </View>
      <View style={[styles.row, {gap: spacing.md, marginTop: spacing.md}]}>
        <StatTile label="Study time" value={formatDuration(totals.studySeconds)} icon="clock" tone="accent" />
        <StatTile label="Day streak" value={String(totals.streak)} icon="flame" tone="warning" sublabel={`Best ${totals.longestStreak}`} />
      </View>

      <Card style={[styles.row, {gap: spacing.lg, marginTop: spacing.md}]}>
        <ProgressRing value={readiness.passProbability} size={96} stroke={9} accessibilityLabel={`Pass chance ${Math.round(readiness.passProbability * 100)} percent`}>
          <Text variant="heading">{Math.round(readiness.passProbability * 100)}%</Text>
        </ProgressRing>
        <View style={styles.flex}>
          <Text variant="bodyStrong">{readiness.label}</Text>
          <Text variant="caption" color="textMuted">
            Estimated chance to pass · {Math.round(readiness.coverage * 100)}% of questions practiced · predicted score{' '}
            {Math.round(readiness.predictedAccuracy * 100)}%
          </Text>
        </View>
      </Card>

      <View style={{marginTop: spacing.md}}>
        <ReadyChecklist />
      </View>

      <SectionHeader title="Last 14 days" />
      <Card>
        <BarChart
          data={series.map((d, i) => ({label: d.label, value: d.answered, highlight: i === series.length - 1}))}
          height={110}
          accessibilityLabel={`Questions answered per day for the last 14 days. Today: ${series[series.length - 1]?.answered ?? 0}`}
        />
      </Card>

      <SectionHeader title="Topic mastery" />
      <Card style={{gap: spacing.lg}}>
        {topics.length ? (
          topics.map(t => {
            const meta = getTopic(t.topic);
            const color = hueAt(colors, meta?.hue ?? 0);
            return (
              <View key={t.topic} style={{gap: 6}}>
                <View style={[styles.row, {gap: spacing.sm}]}>
                  <Text variant="captionStrong" style={styles.flex} numberOfLines={1} onPress={() => navigation.navigate('Topic', {topic: t.topic})}>
                    {meta?.title ?? t.topic}
                  </Text>
                  <Text variant="caption" color="textMuted">
                    {t.seen}/{t.total} · {percent(t.accuracy)}
                  </Text>
                </View>
                <MasteryBar seen={t.seen} mastered={t.mastered} total={t.total} color={color} />
              </View>
            );
          })
        ) : (
          <Text variant="body" color="textMuted">
            Answer some questions to see your mastery by topic.
          </Text>
        )}
      </Card>

      <SectionHeader title="Exam simulations" actionLabel={trackExams.length ? 'All' : undefined} onAction={() => navigation.navigate('ExamHistory')} />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        {trackExams.length ? (
          trackExams.slice(0, 3).map((e, i) => (
            <React.Fragment key={e.id}>
              {i ? <Divider /> : null}
              <ListRow
                title={`${e.correct}/${e.total} · ${Math.round((e.correct / Math.max(1, e.total)) * 100)}%`}
                subtitle={`${new Date(e.at).toLocaleDateString()} · ${e.title}`}
                icon={e.passed ? 'badge-check' : 'circle-x'}
                iconColor={e.passed ? colors.success : colors.danger}
                right={<Chip label={e.passed ? 'Passed' : 'Failed'} tone={e.passed ? 'success' : 'danger'} />}
                chevron={false}
              />
            </React.Fragment>
          ))
        ) : (
          <ListRow title="No exam simulations yet" subtitle="Take one to see how you'd score today" icon="clipboard-check" iconColor={colors.accent} onPress={() => navigation.navigate('ExamIntro', {})} />
        )}
      </Card>

      <SectionHeader title={`Achievements · ${unlockedList.length}/${ACHIEVEMENTS.length}`} actionLabel="All" onAction={() => navigation.navigate('Achievements')} />
      <Card onPress={() => navigation.navigate('Achievements')} accessibilityLabel={`${unlockedList.length} of ${ACHIEVEMENTS.length} achievements unlocked`}>
        <View style={[styles.wrap, {gap: spacing.md}]}>
          {(unlockedList.length ? unlockedList : ACHIEVEMENTS).slice(0, 6).map(a => (
            <View key={a.id} style={[styles.badge, !unlocked[a.id] && styles.locked]}>
              <IconTile name={unlocked[a.id] ? a.icon : 'lock'} color={unlocked[a.id] ? TIER_COLORS[a.tier] : colors.textFaint} size={48} />
              <Text variant="caption" align="center" numberOfLines={2} style={{marginTop: 4}}>
                {a.title}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <SectionHeader title="Review" />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        <ListRow title="Mistakes" icon="circle-x" iconColor={colors.danger} onPress={() => navigation.navigate('QuestionList', {kind: 'mistakes'})} />
        <Divider />
        <ListRow title="Saved questions" icon="bookmark" iconColor={colors.primary} onPress={() => navigation.navigate('QuestionList', {kind: 'bookmarks'})} />
        {track === 'car' ? (
          <>
            <Divider />
            <ListRow title="Driving log" icon="car-front" iconColor={colors.success} onPress={() => navigation.navigate('DriveLog')} />
          </>
        ) : null}
      </Card>
      <View style={[styles.row, {gap: spacing.xs, marginTop: spacing.lg, justifyContent: 'center'}]}>
        <Icon name="lock" size={12} color="textFaint" />
        <Text variant="caption" color="textFaint">
          Your progress stays on this device.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  wrap: {flexDirection: 'row', flexWrap: 'wrap'},
  badge: {width: 84, alignItems: 'center'},
  locked: {opacity: 0.5},
});
