import React, {useMemo} from 'react';
import {Share, StyleSheet, View} from 'react-native';
import {
  Button,
  Card,
  Confetti,
  EmptyState,
  Icon,
  IconTile,
  ProgressBar,
  ProgressRing,
  Screen,
  SectionHeader,
  StatTile,
  Text,
} from '../../components';
import {getBank} from '../../data/bank';
import {getTopic, topicTitle} from '../../data/tracks';
import type {TopicId} from '../../data/types';
import {getAchievement} from '../../engine/achievements';
import {formatDuration} from '../../engine/dates';
import {scoreSession} from '../../engine/quiz';
import {useReadiness} from '../../hooks/useLearner';
import type {RootScreenProps} from '../../navigation/types';
import {getSession} from '../../store/session';
import {useTheme} from '../../theme/ThemeProvider';

const TIER_COLOR = {bronze: '#C07A3B', silver: '#8D99AE', gold: '#E0A100'} as const;

export function ResultsScreen({navigation, route}: RootScreenProps<'Results'>) {
  const {colors, spacing} = useTheme();
  const {sessionId, unlocked = [], newBest = false, previousBest = 0} = route.params;
  const session = getSession(sessionId);
  const readiness = useReadiness();
  const data = useMemo(() => {
    if (!session) {
      return null;
    }
    const bank = getBank(session.track, session.state);
    return {bank, result: scoreSession(session, bank)};
  }, [session]);

  if (!session || !data) {
    return (
      <Screen>
        <EmptyState
          icon="clipboard"
          title="Results unavailable"
          message="These results are no longer in memory. Your progress and exam history are saved."
          actionLabel="Done"
          onAction={() => navigation.navigate('Tabs')}
        />
      </Screen>
    );
  }

  const {result} = data;
  const mode = session.spec.mode;
  const isExam = mode === 'exam';
  const passed = result.passed === true;
  const pct = result.percent;
  const accent = isExam ? (passed ? colors.success : colors.danger) : pct >= 80 ? colors.success : pct >= 60 ? colors.warning : colors.danger;
  const celebrate = (isExam && passed) || (!isExam && result.total >= 5 && pct === 100) || newBest;

  const headline = isExam
    ? passed
      ? 'You passed!'
      : 'Not quite — keep going'
    : mode === 'survival'
      ? newBest
        ? 'New personal best!'
        : 'Run complete'
      : mode === 'speed'
        ? newBest
          ? 'New personal best!'
          : 'Time’s up!'
        : pct >= 90
          ? 'Excellent work!'
          : pct >= 70
            ? 'Nice progress!'
            : 'Keep practicing';

  const subline = isExam
    ? `${result.correct} of ${result.total} correct · ${result.passingScore} needed to pass${session.endedEarly ? ' · test ended once the result was decided' : ''}${session.timedOut ? ' · time ran out' : ''}`
    : mode === 'survival' || mode === 'speed'
      ? `${result.correct} correct answer${result.correct === 1 ? '' : 's'}${previousBest && !newBest ? ` · best ${previousBest}` : ''}`
      : `${result.correct} of ${result.answered} answered correctly`;

  const topics = (Object.entries(result.byTopic) as [TopicId, [number, number]][])
    .filter(([, v]) => v && v[1] > 0)
    .sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]);

  const share = () =>
    Share.share({
      message: isExam
        ? `I ${passed ? 'passed' : 'took'} the ${session.title} practice exam in DriveReady: ${result.correct}/${result.total} (${pct}%). Free DMV practice tests for every state.`
        : `I scored ${result.correct}/${result.answered} on a ${session.title} in DriveReady — free DMV practice tests for every state.`,
    });

  return (
    <Screen
      footer={
        <View style={[styles.row, {gap: spacing.md}]}>
          <Button title="Done" variant="outline" onPress={() => navigation.navigate('Tabs')} style={styles.flex} testID="results-done" />
          <Button
            title={isExam ? 'New exam' : 'Practice again'}
            icon="repeat"
            onPress={() => navigation.replace('Quiz', {spec: session.spec.mode === 'custom' ? {...session.spec} : {...session.spec, questionIds: undefined}})}
            style={styles.flex2}
            testID="results-again"
          />
        </View>
      }>
      <Card style={styles.center}>
        <ProgressRing value={result.total ? result.correct / result.total : 0} size={150} stroke={12} color={accent} accessibilityLabel={`Score ${pct} percent`}>
          {isExam ? (
            <Icon name={passed ? 'badge-check' : 'circle-x'} size={34} color={accent} />
          ) : null}
          <Text variant="title">{mode === 'survival' || mode === 'speed' ? result.correct : `${pct}%`}</Text>
        </ProgressRing>
        <Text variant="title" align="center" style={{marginTop: spacing.lg}} accessibilityRole="header" testID="results-headline">
          {headline}
        </Text>
        <Text variant="body" color="textMuted" align="center" style={{marginTop: spacing.xs}}>
          {subline}
        </Text>
        {isExam && !passed ? (
          <Text variant="caption" color="textMuted" align="center" style={{marginTop: spacing.sm}}>
            Review your mistakes below, then try again — most people pass after a few practice exams.
          </Text>
        ) : null}
      </Card>

      <View style={[styles.row, {gap: spacing.md, marginTop: spacing.md}]}>
        <StatTile label="Correct" value={String(result.correct)} icon="circle-check" tone="success" />
        <StatTile label="Wrong" value={String(result.wrong)} icon="circle-x" tone="danger" />
        <StatTile label="Time" value={formatDuration(result.durationSec)} icon="clock" tone="primary" />
      </View>
      {result.sections ? (
        <Card style={{marginTop: spacing.md, gap: spacing.sm}}>
          <Text variant="label" color="textMuted">
            Test parts
          </Text>
          {(
            [
              ['Road signs', result.sections.signs],
              ['Rules of the road', result.sections.rules],
            ] as const
          ).map(([label, sec]) => {
            const ok = sec.need === null || sec.correct >= sec.need;
            return (
              <View key={label} style={[styles.row, {gap: spacing.sm}]}>
                <Icon name={ok ? 'circle-check' : 'circle-x'} size={18} color={ok ? colors.success : colors.danger} />
                <Text variant="body" style={styles.flex}>
                  {label}
                </Text>
                <Text variant="bodyStrong">
                  {sec.correct}/{sec.total}
                  {sec.need !== null ? ` (need ${sec.need})` : ''}
                </Text>
              </View>
            );
          })}
          {result.passed === false && result.passingScore !== null && result.correct >= result.passingScore ? (
            <Text variant="caption" color="danger">
              Your overall score was high enough, but each part must be passed on its own.
            </Text>
          ) : null}
        </Card>
      ) : null}
      {result.skipped > 0 && isExam ? (
        <Text variant="caption" color="textMuted" style={{marginTop: spacing.sm}}>
          {result.skipped} unanswered question{result.skipped === 1 ? '' : 's'} counted as wrong.
        </Text>
      ) : null}

      {unlocked.length ? (
        <>
          <SectionHeader title="Achievements unlocked" />
          <View style={{gap: spacing.sm}}>
            {unlocked.map(id => {
              const a = getAchievement(id);
              if (!a) {
                return null;
              }
              return (
                <Card key={id} variant="tinted" tint={colors.goldSoft} style={[styles.row, {gap: spacing.md}]}>
                  <IconTile name={a.icon} color={TIER_COLOR[a.tier]} size={44} />
                  <View style={styles.flex}>
                    <Text variant="bodyStrong">{a.title}</Text>
                    <Text variant="caption" color="textMuted">
                      {a.description}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        </>
      ) : null}

      {topics.length > 1 ? (
        <>
          <SectionHeader title="By topic" />
          <Card style={{gap: spacing.md}}>
            {topics.map(([topic, [c, n]]) => {
              const meta = getTopic(topic);
              const ratio = n ? c / n : 0;
              return (
                <View key={topic} style={{gap: 6}}>
                  <View style={styles.row}>
                    <Text variant="captionStrong" style={styles.flex} numberOfLines={1}>
                      {meta?.title ?? topicTitle(topic)}
                    </Text>
                    <Text variant="captionStrong" color={ratio >= 0.8 ? 'success' : ratio >= 0.6 ? 'warning' : 'danger'}>
                      {c}/{n}
                    </Text>
                  </View>
                  <ProgressBar value={ratio} height={6} color={ratio >= 0.8 ? colors.success : ratio >= 0.6 ? colors.warning : colors.danger} />
                </View>
              );
            })}
          </Card>
        </>
      ) : null}

      {isExam ? (
        <Card variant="tinted" tint={colors.primarySoft} style={[styles.row, {gap: spacing.md, marginTop: spacing.md}]}>
          <Icon name="sparkles" color={colors.primary} />
          <Text variant="body" style={styles.flex}>
            Estimated chance to pass the real test: <Text variant="bodyStrong">{Math.round(readiness.passProbability * 100)}%</Text> ({readiness.label.toLowerCase()}).
          </Text>
        </Card>
      ) : null}

      <View style={{gap: spacing.md, marginTop: spacing.xl}}>
        <Button title="Review answers" variant="secondary" icon="list-checks" onPress={() => navigation.navigate('Review', {sessionId: session.id})} fullWidth testID="results-review" />
        {result.wrongIds.length ? (
          <Button
            title={`Retry ${result.wrongIds.length} missed question${result.wrongIds.length === 1 ? '' : 's'}`}
            variant="outline"
            icon="reset"
            onPress={() => navigation.replace('Quiz', {spec: {mode: 'custom', title: 'Retry Missed', questionIds: result.wrongIds}})}
            fullWidth
            testID="results-retry"
          />
        ) : null}
        <Button title="Share score" variant="ghost" icon="share" onPress={share} fullWidth />
      </View>
      <Confetti run={celebrate} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  flex2: {flex: 2},
  row: {flexDirection: 'row', alignItems: 'center'},
  center: {alignItems: 'center'},
});
