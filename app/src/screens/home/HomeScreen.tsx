import React, {useMemo} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Button, Card, Chip, Icon, IconButton, ListRow, ProgressBar, ProgressRing, ReadyChecklist, Screen, SectionHeader, Text, Divider} from '../../components';
import {getTopic} from '../../data/tracks';
import type {TopicId} from '../../data/types';
import {currentStreak, dayKey, daysUntil} from '../../engine/dates';
import {activeDayMap} from '../../engine/stats';
import {useLearner, useReadiness} from '../../hooks/useLearner';
import type {TabScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {useSettings} from '../../store/settings';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {greeting, plural} from '../practice/shared/format';
import {useDailyChallengeDone, useModeCounts, useNow, usePersonalBest} from '../practice/shared/hooks';
import {latestMarathon, questionOfTheDay} from '../practice/shared/practiceData';
import {ModeTile, TileGrid} from '../practice/shared/ui';

export function HomeScreen({navigation}: TabScreenProps<'Home'>) {
  const {colors, spacing, radius} = useTheme();
  const learner = useLearner();
  const {bank, track, state, stateInfo, trackMeta} = learner;
  const readiness = useReadiness();
  const now = useNow(navigation);
  const name = useSettings(s => s.name);
  const dailyGoal = useSettings(s => s.dailyGoal);
  const examDate = useSettings(s => s.examDate);
  const days = useProgress(s => s.days);
  const marathons = useProgress(s => s.marathons);
  const counts = useModeCounts(now);
  const dailyDone = useDailyChallengeDone(now);
  const bestSurvival = usePersonalBest('survival');
  const bestSpeed = usePersonalBest('speed');
  const today = dayKey(now);

  const todayCount = days[today]?.q ?? 0;
  const streak = useMemo(() => currentStreak(activeDayMap(days), now), [days, now]);
  const qotd = useMemo(() => questionOfTheDay(bank, today), [bank, today]);
  const validTopics = useMemo(() => new Set<TopicId>(trackMeta.topics.map(t => t.id)), [trackMeta]);
  const marathon = useMemo(() => latestMarathon(marathons, track, state, validTopics), [marathons, track, state, validTopics]);
  const until = examDate ? daysUntil(examDate, now) : null;
  const hasSupervisedHours = stateInfo.facts.some(f => f.key === 'supervised_driving_hours');
  const pct = Math.round(readiness.passProbability * 100);
  // A pass estimate from a handful of answers is noise; wait for 10.
  const hasEstimate = readiness.seen >= 10;
  const empty = bank.questions.length === 0;
  const isNew = readiness.seen === 0;
  const firstTopic = trackMeta.topics.find(t => (bank.byTopic.get(t.id)?.length ?? 0) > 0);
  const weakest = isNew ? firstTopic : readiness.weakest ? getTopic(readiness.weakest.topic) : undefined;

  return (
    <Screen edges={['top']}>
      <View style={[styles.row, {marginBottom: spacing.lg, gap: spacing.md}]}>
        <View style={styles.flex}>
          <Text variant="captionStrong" color="textMuted">
            {greeting(new Date(now).getHours())}
            {name ? `, ${name}` : ''}
          </Text>
          <Pressable
            onPress={() => navigation.navigate('PickState', {mode: 'change'})}
            accessibilityRole="button"
            accessibilityLabel={`${stateInfo.name}, ${trackMeta.title}. Change state`}
            style={[styles.row, {gap: 6}]}>
            <Text variant="title" numberOfLines={1} style={styles.shrink} accessibilityRole="header">
              {stateInfo.name}
            </Text>
            <Icon name="chevron-down" size={20} color="textMuted" />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('PickTrack', {mode: 'change'})} accessibilityRole="button" accessibilityLabel={`Test type: ${trackMeta.title}. Change`}>
            <Chip label={trackMeta.license} icon={trackMeta.icon} tone="primary" />
          </Pressable>
        </View>
        <IconButton icon="settings" accessibilityLabel="Settings" onPress={() => navigation.navigate('Settings')} background={colors.surface} testID="home-settings" />
      </View>

      {empty ? (
        <Card variant="tinted" tint={colors.warningSoft} style={{marginBottom: spacing.md}}>
          <Text variant="bodyStrong">Questions are on the way</Text>
          <Text variant="caption" color="textMuted">
            We’re finishing the {trackMeta.short} question bank for {stateInfo.name}. Check the State Cheat Sheet and road signs meanwhile.
          </Text>
        </Card>
      ) : null}

      <Card variant="tinted" tint={colors.primary} style={{padding: spacing.xl}}>
        <View style={[styles.row, {gap: spacing.lg}]}>
          <ProgressRing
            value={hasEstimate ? readiness.passProbability : 0}
            size={112}
            stroke={10}
            color="#FFFFFF"
            trackColor="rgba(255,255,255,0.25)"
            accessibilityLabel={hasEstimate ? `Estimated pass chance ${pct} percent` : 'Pass chance appears after 10 answers'}>
            <Text variant="title" color="#FFFFFF">
              {hasEstimate ? `${pct}%` : '\u2013'}
            </Text>
            <Text variant="caption" color="#E2ECFF">
              pass chance
            </Text>
          </ProgressRing>
          <View style={styles.flex}>
            <Text variant="heading" color="#FFFFFF">
              {hasEstimate ? readiness.label : isNew ? 'Let\u2019s get started' : 'Keep going'}
            </Text>
            <Text variant="caption" color="#E2ECFF" style={{marginTop: 4}}>
              {hasEstimate
                ? `${readiness.seen} of ${readiness.total} questions practiced · ${readiness.mastered} mastered`
                : `Answer ${10 - readiness.seen} more question${10 - readiness.seen === 1 ? '' : 's'} to see your pass chance · ${readiness.total} questions in your bank`}
            </Text>
          </View>
        </View>
        <Button
          title="Take a practice exam"
          icon="clipboard-check"
          variant="secondary"
          onPress={() => navigation.navigate('ExamIntro', {})}
          style={{marginTop: spacing.lg, backgroundColor: '#FFFFFF'}}
          fullWidth
          disabled={empty}
          testID="home-exam"
        />
      </Card>

      <View style={[styles.row, {gap: spacing.md, marginTop: spacing.md}]}>
        <Card style={styles.flex}>
          <View style={[styles.row, {gap: 6}]}>
            <Icon name="target" size={18} color={colors.primary} />
            <Text variant="captionStrong" color="textMuted">
              Today
            </Text>
          </View>
          <Text variant="heading" style={{marginTop: spacing.xs}}>
            {Math.min(todayCount, 999)}/{dailyGoal}
          </Text>
          <ProgressBar value={todayCount / Math.max(1, dailyGoal)} height={6} color={todayCount >= dailyGoal ? colors.success : colors.primary} style={{marginTop: spacing.sm}} accessibilityLabel="Daily goal progress" />
        </Card>
        <Card style={styles.flex}>
          <View style={[styles.row, {gap: 6}]}>
            <Icon name="flame" size={18} color={streak ? colors.warning : colors.textFaint} />
            <Text variant="captionStrong" color="textMuted">
              Streak
            </Text>
          </View>
          <Text variant="heading" style={{marginTop: spacing.xs}}>
            {plural(streak, 'day')}
          </Text>
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {todayCount > 0 ? 'Studied today' : streak ? 'Study today to keep it' : 'Start one today'}
          </Text>
        </Card>
      </View>

      {marathon || weakest ? (
        <Card
          style={{marginTop: spacing.md}}
          onPress={() =>
            marathon
              ? navigation.navigate('Quiz', {spec: {mode: 'marathon', topic: marathon.topic}})
              : weakest && navigation.navigate('Topic', {topic: weakest.id})
          }
          accessibilityLabel={marathon ? 'Continue marathon' : `Practice weakest topic ${weakest?.title}`}>
          <View style={[styles.row, {gap: spacing.md}]}>
            <View style={[styles.circle, {backgroundColor: colors.accentSoft}]}>
              <Icon name={marathon ? 'infinity' : 'trending'} color={colors.accent} />
            </View>
            <View style={styles.flex}>
              <Text variant="captionStrong" color="textMuted">
                {marathon ? 'Continue' : isNew ? 'Start here' : 'Focus area'}
              </Text>
              <Text variant="bodyStrong" numberOfLines={1}>
                {marathon
                  ? `Marathon${marathon.topic ? ` · ${getTopic(marathon.topic)?.title ?? ''}` : ''} — ${marathon.state.index}/${marathon.state.ids.length}`
                  : weakest?.title}
              </Text>
            </View>
            <Icon name="chevron-right" color="textFaint" />
          </View>
          {marathon ? (
            <ProgressBar value={marathon.state.index / Math.max(1, marathon.state.ids.length)} height={5} color={colors.accent} style={{marginTop: spacing.md}} />
          ) : null}
        </Card>
      ) : null}

      {!empty && readiness.seen > 0 ? (
        <View style={{marginTop: spacing.md}}>
          <ReadyChecklist compact />
        </View>
      ) : null}

      <SectionHeader title="Study" />
      <TileGrid>
        <ModeTile title="Practice test" subtitle="20 smart questions" icon="target" color={hueAt(colors, 0)} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'practice'}})} disabled={empty} testID="tile-practice" />
        <ModeTile title="Exam simulator" subtitle={`${learner.exam.questions} Q · pass ${learner.exam.passingScore}`} icon="clipboard-check" color={hueAt(colors, 3)} onPress={() => navigation.navigate('ExamIntro', {})} disabled={empty} />
        <ModeTile title="Mistakes" subtitle={counts.mistakes ? `${counts.mistakes} to fix` : 'None yet'} icon="circle-x" color={hueAt(colors, 4)} badge={counts.mistakes} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'mistakes'}})} disabled={!counts.mistakes} />
        <ModeTile title="Road signs" subtitle={counts.signs ? `${counts.signs} sign questions` : 'Sign library'} icon="signpost" color={hueAt(colors, 2)} onPress={() => (counts.signs ? navigation.navigate('Quiz', {spec: {mode: 'signs'}}) : navigation.navigate('Tabs', {screen: 'Signs'}))} />
        <ModeTile title="Daily challenge" subtitle={dailyDone ? 'Done for today' : '10 questions'} icon="calendar" color={hueAt(colors, 1)} done={dailyDone} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'daily'}})} disabled={empty} />
        <ModeTile title="Smart review" subtitle={counts.due ? `${counts.due} due now` : 'Nothing due'} icon="brain" color={hueAt(colors, 5)} badge={counts.due} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'due'}})} disabled={!counts.due} />
        <ModeTile title="Survival" subtitle={bestSurvival ? `Best: ${bestSurvival}` : '3 lives'} icon="heart" color={hueAt(colors, 6)} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'survival'}})} disabled={empty} />
        <ModeTile title="Speed round" subtitle={bestSpeed ? `Best: ${bestSpeed}` : '2 minutes'} icon="zap" color={hueAt(colors, 2)} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'speed'}})} disabled={empty} />
      </TileGrid>

      {until !== null && until >= 0 ? (
        <Card style={{marginTop: spacing.md}} onPress={() => navigation.navigate('StudyPlan')} accessibilityLabel="Open study plan">
          <View style={[styles.row, {gap: spacing.md}]}>
            <View style={[styles.countdown, {backgroundColor: colors.primarySoft, borderRadius: radius.md}]}>
              <Text variant="title" color="primary">
                {until}
              </Text>
              <Text variant="caption" color="primary">
                {until === 1 ? 'day' : 'days'}
              </Text>
            </View>
            <View style={styles.flex}>
              <Text variant="bodyStrong">{until === 0 ? 'Your test is today — good luck!' : 'Until your test'}</Text>
              <Text variant="caption" color="textMuted">
                See your day-by-day study plan
              </Text>
            </View>
            <Icon name="chevron-right" color="textFaint" />
          </View>
        </Card>
      ) : null}

      {qotd ? (
        <>
          <SectionHeader title="Question of the day" />
          <Card onPress={() => navigation.navigate('QuestionDetail', {id: qotd.question.id})} accessibilityLabel={`Question of the day: ${qotd.question.prompt}`}>
            <View style={[styles.row, {gap: spacing.sm, marginBottom: spacing.sm}]}>
              <Icon name="lightbulb" size={18} color={colors.warning} />
              <Text variant="captionStrong" color="textMuted">
                {getTopic(qotd.question.topic)?.title}
              </Text>
            </View>
            <Text variant="subheading">{qotd.question.prompt}</Text>
            <Text variant="captionStrong" color="primary" style={{marginTop: spacing.md}}>
              Tap to answer
            </Text>
          </Card>
        </>
      ) : null}

      <SectionHeader title="Resources" />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        <ListRow title={`${stateInfo.name} cheat sheet`} subtitle="Key numbers and rules, verified" icon="file" iconColor={hueAt(colors, 0)} onPress={() => navigation.navigate('CheatSheet')} />
        <Divider />
        <ListRow title="About your test" subtitle={`${learner.exam.questions} questions · ${learner.exam.passingScore} to pass`} icon="info" iconColor={hueAt(colors, 5)} onPress={() => navigation.navigate('ExamInfo')} />
        {track === 'car' && hasSupervisedHours ? (
          <>
            <Divider />
            <ListRow title="Driving log" subtitle="Track supervised practice hours" icon="car-front" iconColor={hueAt(colors, 1)} onPress={() => navigation.navigate('DriveLog')} />
          </>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  shrink: {flexShrink: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  circle: {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center'},
  countdown: {width: 64, height: 64, alignItems: 'center', justifyContent: 'center'},
});
