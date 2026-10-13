import React, {useLayoutEffect, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Card, Divider, EmptyState, IconTile, ListRow, Screen, SectionHeader, StatTile, Text} from '../../components';
import {getLessonsForTopic} from '../../data/lessons';
import {getTopic} from '../../data/tracks';
import {useLearner} from '../../hooks/useLearner';
import type {RootScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {percent, plural} from './shared/format';
import {useModeCounts, useNow, useTopicProgress} from './shared/hooks';
import {marathonFor, questionStatus, sortByStatus} from './shared/practiceData';
import {MasteryBar, StatusChip} from './shared/ui';

export function TopicScreen({navigation, route}: RootScreenProps<'Topic'>) {
  const {colors, spacing} = useTheme();
  const {topic: topicId} = route.params;
  const meta = getTopic(topicId);
  const {bank, exams, track, state} = useLearner();
  const now = useNow(navigation);
  const progress = useTopicProgress(now).get(topicId);
  const counts = useModeCounts(now, topicId);
  const stats = useProgress(s => s.stats);
  const marathons = useProgress(s => s.marathons);
  const questions = useMemo(() => bank.byTopic.get(topicId) ?? [], [bank, topicId]);
  const preview = useMemo(() => sortByStatus(questions, stats).slice(0, 5), [questions, stats]);
  const lessons = getLessonsForTopic(topicId).filter(l => l.track === track);
  const topicExam = exams.find(e => e.topic === topicId);
  const marathon = marathonFor(marathons, track, state, topicId);
  const color = meta ? hueAt(colors, meta.hue) : colors.primary;

  useLayoutEffect(() => {
    navigation.setOptions({title: meta?.title ?? ''});
  }, [navigation, meta]);

  if (!meta) {
    return (
      <Screen>
        <EmptyState icon="alert" title="Topic not found" message="Try another topic." actionLabel="Go back" onAction={() => navigation.goBack()} />
      </Screen>
    );
  }

  const total = questions.length;
  const start = (count?: number) => navigation.navigate('Quiz', {spec: {mode: 'practice', topic: topicId, count, title: meta.title}});

  return (
    <Screen>
      <Card>
        <View style={[styles.row, {gap: spacing.md}]}>
          <IconTile name={meta.icon} color={color} size={52} />
          <View style={styles.flex}>
            <Text variant="heading" accessibilityRole="header">
              {meta.title}
            </Text>
            <Text variant="caption" color="textMuted">
              {plural(total, 'question')}
            </Text>
          </View>
        </View>
        <Text variant="body" color="textMuted" style={{marginTop: spacing.md}}>
          {meta.description}
        </Text>
        {total ? <MasteryBar seen={progress?.seen ?? 0} mastered={progress?.mastered ?? 0} total={total} color={color} height={8} style={{marginTop: spacing.lg}} /> : null}
      </Card>

      {total ? (
        <>
          <View style={[styles.row, {gap: spacing.md, marginTop: spacing.md}]}>
            <StatTile label="Practiced" value={`${progress?.seen ?? 0}/${total}`} icon="eye" tone="primary" />
            <StatTile label="Accuracy" value={percent(progress?.accuracy)} icon="target" tone="success" />
            <StatTile label="Mastered" value={String(progress?.mastered ?? 0)} icon="badge-check" tone="gold" />
          </View>

          <SectionHeader title="Practice" />
          <View style={{gap: spacing.md}}>
            <Button title={`Practice ${Math.min(10, total)} questions`} icon="play" onPress={() => start(10)} fullWidth testID="topic-practice-10" />
            <View style={[styles.row, {gap: spacing.md}]}>
              {total > 10 ? <Button title="20 questions" variant="secondary" onPress={() => start(20)} style={styles.flex} /> : null}
              <Button title={`All ${total}`} variant="secondary" onPress={() => start(total)} style={styles.flex} />
            </View>
            <Button
              title={marathon ? `Resume marathon (${marathon.index}/${marathon.ids.length})` : 'Marathon this topic'}
              variant="outline"
              icon="infinity"
              onPress={() => navigation.navigate('Quiz', {spec: {mode: 'marathon', topic: topicId}})}
              fullWidth
            />
            {counts.mistakes ? (
              <Button title={`Fix ${counts.mistakes} mistake${counts.mistakes === 1 ? '' : 's'}`} variant="outline" icon="circle-x" onPress={() => navigation.navigate('Quiz', {spec: {mode: 'mistakes', topic: topicId}})} fullWidth />
            ) : null}
            {topicExam ? (
              <Button title={`${topicExam.title} exam (${topicExam.questions} Q)`} variant="outline" icon="clipboard-check" onPress={() => navigation.navigate('ExamIntro', {examId: topicExam.id})} fullWidth />
            ) : null}
          </View>
        </>
      ) : (
        <EmptyState icon="clipboard" title="Questions coming soon" message="This topic's questions for your state are being prepared." />
      )}

      {lessons.length ? (
        <>
          <SectionHeader title="Study first" />
          <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
            {lessons.map((l, i) => (
              <React.Fragment key={l.id}>
                {i ? <Divider /> : null}
                <ListRow title={l.title} subtitle={`${l.minutes} min read`} icon="book" iconColor={color} onPress={() => navigation.navigate('Lesson', {lessonId: l.id})} />
              </React.Fragment>
            ))}
          </Card>
        </>
      ) : null}

      {preview.length ? (
        <>
          <SectionHeader title="Questions" />
          <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
            {preview.map((q, i) => (
              <React.Fragment key={q.id}>
                {i ? <Divider /> : null}
                <ListRow title={q.prompt} right={<StatusChip status={questionStatus(stats[q.id])} />} onPress={() => navigation.navigate('QuestionDetail', {id: q.id})} />
              </React.Fragment>
            ))}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
});
