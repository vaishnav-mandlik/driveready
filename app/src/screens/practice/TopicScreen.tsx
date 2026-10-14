import React, {useLayoutEffect, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Card, Divider, EmptyState, IconTile, ListRow, Screen, SectionHeader, StatTile, Text} from '../../components';
import {getLessonsForTopic} from '../../data/lessons';
import {getTopic} from '../../data/tracks';
import {useLearner} from '../../hooks/useLearner';
import {defineStrings, useStrings} from '../../i18n';
import type {RootScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {formatCount, percent} from './shared/format';
import {useModeCounts, useNow, useTopicProgress} from './shared/hooks';
import {marathonFor, questionStatus, sortByStatus} from './shared/practiceData';
import {MasteryBar, StatusChip} from './shared/ui';

const STR = defineStrings(
  {
    notFound: 'Topic not found',
    notFoundMsg: 'Try another topic.',
    goBack: 'Go back',
    questions: (n: number) => (n === 1 ? '1 question' : `${formatCount(n)} questions`),
    practiced: 'Practiced',
    accuracy: 'Accuracy',
    mastered: 'Mastered',
    practice: 'Practice',
    practiceN: (n: number) => `Practice ${n} questions`,
    twenty: '20 questions',
    all: (n: number) => `All ${n}`,
    resumeMarathon: (index: number, total: number) => `Resume marathon (${index}/${total})`,
    marathon: 'Marathon this topic',
    fixMistakes: (n: number) => `Fix ${n} mistake${n === 1 ? '' : 's'}`,
    topicExam: (title: string, n: number) => `${title} exam (${n} Q)`,
    comingSoon: 'Questions coming soon',
    comingSoonMsg: 'This topic\'s questions for your state are being prepared.',
    studyFirst: 'Study first',
    minRead: (n: number) => `${n} min read`,
    questionsHeader: 'Questions',
  },
  {
    notFound: 'Tema no encontrado',
    notFoundMsg: 'Prueba con otro tema.',
    goBack: 'Regresar',
    questions: (n: number) => (n === 1 ? '1 pregunta' : `${formatCount(n)} preguntas`),
    practiced: 'Practicadas',
    accuracy: 'Aciertos',
    mastered: 'Dominadas',
    practice: 'Práctica',
    practiceN: (n: number) => (n === 1 ? 'Practicar 1 pregunta' : `Practicar ${n} preguntas`),
    twenty: '20 preguntas',
    all: (n: number) => `Todas (${n})`,
    resumeMarathon: (index: number, total: number) => `Continuar maratón (${index}/${total})`,
    marathon: 'Maratón de este tema',
    fixMistakes: (n: number) => (n === 1 ? 'Corregir 1 error' : `Corregir ${n} errores`),
    topicExam: (title: string, n: number) => `Examen ${title} (${n} preg.)`,
    comingSoon: 'Preguntas próximamente',
    comingSoonMsg: 'Estamos preparando las preguntas de este tema para tu estado.',
    studyFirst: 'Estudia primero',
    minRead: (n: number) => `${n} min de lectura`,
    questionsHeader: 'Preguntas',
  },
);

export function TopicScreen({navigation, route}: RootScreenProps<'Topic'>) {
  const {colors, spacing} = useTheme();
  const t = useStrings(STR);
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
        <EmptyState icon="alert" title={t.notFound} message={t.notFoundMsg} actionLabel={t.goBack} onAction={() => navigation.goBack()} />
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
              {t.questions(total)}
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
            <StatTile label={t.practiced} value={`${progress?.seen ?? 0}/${total}`} icon="eye" tone="primary" />
            <StatTile label={t.accuracy} value={percent(progress?.accuracy)} icon="target" tone="success" />
            <StatTile label={t.mastered} value={String(progress?.mastered ?? 0)} icon="badge-check" tone="gold" />
          </View>

          <SectionHeader title={t.practice} />
          <View style={{gap: spacing.md}}>
            <Button title={t.practiceN(Math.min(10, total))} icon="play" onPress={() => start(10)} fullWidth testID="topic-practice-10" />
            <View style={[styles.row, {gap: spacing.md}]}>
              {total > 10 ? <Button title={t.twenty} variant="secondary" onPress={() => start(20)} style={styles.flex} /> : null}
              <Button title={t.all(total)} variant="secondary" onPress={() => start(total)} style={styles.flex} />
            </View>
            <Button
              title={marathon ? t.resumeMarathon(marathon.index, marathon.ids.length) : t.marathon}
              variant="outline"
              icon="infinity"
              onPress={() => navigation.navigate('Quiz', {spec: {mode: 'marathon', topic: topicId}})}
              fullWidth
            />
            {counts.mistakes ? (
              <Button title={t.fixMistakes(counts.mistakes)} variant="outline" icon="circle-x" onPress={() => navigation.navigate('Quiz', {spec: {mode: 'mistakes', topic: topicId}})} fullWidth />
            ) : null}
            {topicExam ? (
              <Button title={t.topicExam(topicExam.title, topicExam.questions)} variant="outline" icon="clipboard-check" onPress={() => navigation.navigate('ExamIntro', {examId: topicExam.id})} fullWidth />
            ) : null}
          </View>
        </>
      ) : (
        <EmptyState icon="clipboard" title={t.comingSoon} message={t.comingSoonMsg} />
      )}

      {lessons.length ? (
        <>
          <SectionHeader title={t.studyFirst} />
          <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
            {lessons.map((l, i) => (
              <React.Fragment key={l.id}>
                {i ? <Divider /> : null}
                <ListRow title={l.title} subtitle={t.minRead(l.minutes)} icon="book" iconColor={color} onPress={() => navigation.navigate('Lesson', {lessonId: l.id})} />
              </React.Fragment>
            ))}
          </Card>
        </>
      ) : null}

      {preview.length ? (
        <>
          <SectionHeader title={t.questionsHeader} />
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
