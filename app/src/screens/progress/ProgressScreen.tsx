import React, {useMemo} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {BarChart, Card, Chip, Divider, Icon, IconTile, LargeHeader, ListRow, ProgressRing, ReadyChecklist, Screen, SectionHeader, StatTile, Text} from '../../components';
import {getTopic} from '../../data/tracks';
import {achievements} from '../../engine/achievements';
import {formatDuration} from '../../engine/dates';
import {readinessLabelText} from '../../engine/readiness';
import {activitySeries, computeTotals} from '../../engine/stats';
import {useLearner, useReadiness} from '../../hooks/useLearner';
import {defineStrings, formatDate, useStrings} from '../../i18n';
import type {TabScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {percent} from '../practice/shared/format';
import {useNow} from '../practice/shared/hooks';
import {MasteryBar} from '../practice/shared/ui';
import {examRecordTitle} from './ExamHistoryScreen';

export const TIER_COLORS = {bronze: '#C07A3B', silver: '#8D99AE', gold: '#E0A100'} as const;

const STR = defineStrings(
  {
    title: 'Progress',
    answered: 'Answered',
    accuracy: 'Accuracy',
    studyTime: 'Study time',
    dayStreak: 'Day streak',
    best: (n: number) => `Best ${n}`,
    passA11y: (pct: number) => `Pass chance ${pct} percent`,
    estimate: (coverage: number, predicted: number) =>
      `Estimated chance to pass · ${coverage}% of questions practiced · predicted score ${predicted}%`,
    last14: 'Last 14 days',
    chartA11y: (today: number) => `Questions answered per day for the last 14 days. Today: ${today}`,
    topicMastery: 'Topic mastery',
    noTopics: 'Answer some questions to see your mastery by topic.',
    topicA11y: (title: string, seen: number, total: number, accuracy: string) =>
      `${title}: ${seen} of ${total} questions seen, ${accuracy} correct. Opens the topic.`,
    examSims: 'Exam simulations',
    all: 'All',
    passed: 'Passed',
    failed: 'Failed',
    noExams: 'No exam simulations yet',
    noExamsSub: "Take one to see how you'd score today",
    achievements: (unlocked: number, total: number) => `Achievements · ${unlocked}/${total}`,
    achievementsA11y: (unlocked: number, total: number) => `${unlocked} of ${total} achievements unlocked`,
    review: 'Review',
    mistakes: 'Mistakes',
    saved: 'Saved questions',
    driveLog: 'Driving log',
    onDevice: 'Your progress stays on this device.',
  },
  {
    title: 'Progreso',
    answered: 'Respondidas',
    accuracy: 'Precisión',
    studyTime: 'Tiempo de estudio',
    dayStreak: 'Días de racha',
    best: (n: number) => `Mejor: ${n}`,
    passA11y: (pct: number) => `Probabilidad de aprobar: ${pct} por ciento`,
    estimate: (coverage: number, predicted: number) =>
      `Probabilidad estimada de aprobar · ${coverage} % de las preguntas practicadas · calificación prevista ${predicted} %`,
    last14: 'Últimos 14 días',
    chartA11y: (today: number) => `Preguntas respondidas por día en los últimos 14 días. Hoy: ${today}`,
    topicMastery: 'Dominio por tema',
    noTopics: 'Responde algunas preguntas para ver tu dominio por tema.',
    topicA11y: (title: string, seen: number, total: number, accuracy: string) =>
      `${title}: ${seen} de ${total} preguntas vistas, ${accuracy} de aciertos. Abre el tema.`,
    examSims: 'Simulaciones de examen',
    all: 'Ver todo',
    passed: 'Aprobado',
    failed: 'Reprobado',
    noExams: 'Aún no hay simulaciones de examen',
    noExamsSub: 'Haz una para ver qué calificación sacarías hoy',
    achievements: (unlocked: number, total: number) => `Logros · ${unlocked}/${total}`,
    achievementsA11y: (unlocked: number, total: number) => `${unlocked} de ${total} logros desbloqueados`,
    review: 'Repaso',
    mistakes: 'Errores',
    saved: 'Preguntas guardadas',
    driveLog: 'Registro de manejo',
    onDevice: 'Tu progreso se queda en este dispositivo.',
  },
);

export function ProgressScreen({navigation}: TabScreenProps<'Progress'>) {
  const {colors, spacing} = useTheme();
  const t = useStrings(STR);
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
  const allAchievements = useMemo(() => achievements(), []);
  const unlockedList = allAchievements.filter(a => unlocked[a.id]);
  const topics = useMemo(() => [...readiness.topics].sort((a, b) => a.knowledge - b.knowledge), [readiness.topics]);

  return (
    <Screen edges={['top']}>
      <LargeHeader title={t.title} subtitle={trackMeta.title} />

      <View style={[styles.row, {gap: spacing.md}]}>
        <StatTile label={t.answered} value={String(totals.answered)} icon="list-checks" tone="primary" />
        <StatTile label={t.accuracy} value={percent(totals.accuracy)} icon="target" tone="success" />
      </View>
      <View style={[styles.row, {gap: spacing.md, marginTop: spacing.md}]}>
        <StatTile label={t.studyTime} value={formatDuration(totals.studySeconds)} icon="clock" tone="accent" />
        <StatTile label={t.dayStreak} value={String(totals.streak)} icon="flame" tone="warning" sublabel={t.best(totals.longestStreak)} />
      </View>

      <Card style={[styles.row, {gap: spacing.lg, marginTop: spacing.md}]}>
        <ProgressRing value={readiness.passProbability} size={96} stroke={9} accessibilityLabel={t.passA11y(Math.round(readiness.passProbability * 100))}>
          <Text variant="heading">{Math.round(readiness.passProbability * 100)}%</Text>
        </ProgressRing>
        <View style={styles.flex}>
          <Text variant="bodyStrong">{readinessLabelText(readiness.label)}</Text>
          <Text variant="caption" color="textMuted">
            {t.estimate(Math.round(readiness.coverage * 100), Math.round(readiness.predictedAccuracy * 100))}
          </Text>
        </View>
      </Card>

      <View style={{marginTop: spacing.md}}>
        <ReadyChecklist />
      </View>

      <SectionHeader title={t.last14} />
      <Card>
        <BarChart
          data={series.map((d, i) => ({label: d.label, value: d.answered, highlight: i === series.length - 1}))}
          height={110}
          accessibilityLabel={t.chartA11y(series[series.length - 1]?.answered ?? 0)}
        />
      </Card>

      <SectionHeader title={t.topicMastery} />
      <Card style={{gap: spacing.lg}}>
        {topics.length ? (
          topics.map(tp => {
            const meta = getTopic(tp.topic);
            const color = hueAt(colors, meta?.hue ?? 0);
            const title = meta?.title ?? tp.topic;
            return (
              <Pressable
                key={tp.topic}
                onPress={() => navigation.navigate('Topic', {topic: tp.topic})}
                accessibilityRole="button"
                accessibilityLabel={t.topicA11y(title, tp.seen, tp.total, percent(tp.accuracy))}
                style={({pressed}) => ({gap: 6, opacity: pressed ? 0.6 : 1})}>
                <View style={[styles.row, {gap: spacing.sm}]}>
                  <Text variant="captionStrong" style={styles.flex} numberOfLines={1}>
                    {title}
                  </Text>
                  <Text variant="caption" color="textMuted">
                    {tp.seen}/{tp.total} · {percent(tp.accuracy)}
                  </Text>
                </View>
                <MasteryBar seen={tp.seen} mastered={tp.mastered} total={tp.total} color={color} />
              </Pressable>
            );
          })
        ) : (
          <Text variant="body" color="textMuted">
            {t.noTopics}
          </Text>
        )}
      </Card>

      <SectionHeader title={t.examSims} actionLabel={trackExams.length ? t.all : undefined} onAction={() => navigation.navigate('ExamHistory')} />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        {trackExams.length ? (
          trackExams.slice(0, 3).map((e, i) => (
            <React.Fragment key={e.id}>
              {i ? <Divider /> : null}
              <ListRow
                title={`${e.correct}/${e.total} · ${Math.round((e.correct / Math.max(1, e.total)) * 100)}%`}
                subtitle={`${formatDate(e.at)} · ${examRecordTitle(e)}`}
                icon={e.passed ? 'badge-check' : 'circle-x'}
                iconColor={e.passed ? colors.success : colors.danger}
                right={<Chip label={e.passed ? t.passed : t.failed} tone={e.passed ? 'success' : 'danger'} />}
                chevron={false}
              />
            </React.Fragment>
          ))
        ) : (
          <ListRow title={t.noExams} subtitle={t.noExamsSub} icon="clipboard-check" iconColor={colors.accent} onPress={() => navigation.navigate('ExamIntro', {})} />
        )}
      </Card>

      <SectionHeader title={t.achievements(unlockedList.length, allAchievements.length)} actionLabel={t.all} onAction={() => navigation.navigate('Achievements')} />
      <Card onPress={() => navigation.navigate('Achievements')} accessibilityLabel={t.achievementsA11y(unlockedList.length, allAchievements.length)}>
        <View style={[styles.wrap, {gap: spacing.md}]}>
          {(unlockedList.length ? unlockedList : allAchievements).slice(0, 6).map(a => (
            <View key={a.id} style={[styles.badge, !unlocked[a.id] && styles.locked]}>
              <IconTile name={unlocked[a.id] ? a.icon : 'lock'} color={unlocked[a.id] ? TIER_COLORS[a.tier] : colors.textFaint} size={48} />
              <Text variant="caption" align="center" numberOfLines={2} style={{marginTop: 4}}>
                {a.title}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <SectionHeader title={t.review} />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        <ListRow title={t.mistakes} icon="circle-x" iconColor={colors.danger} onPress={() => navigation.navigate('QuestionList', {kind: 'mistakes'})} />
        <Divider />
        <ListRow title={t.saved} icon="bookmark" iconColor={colors.primary} onPress={() => navigation.navigate('QuestionList', {kind: 'bookmarks'})} />
        {track === 'car' ? (
          <>
            <Divider />
            <ListRow title={t.driveLog} icon="car-front" iconColor={colors.success} onPress={() => navigation.navigate('DriveLog')} />
          </>
        ) : null}
      </Card>
      <View style={[styles.row, {gap: spacing.xs, marginTop: spacing.lg, justifyContent: 'center'}]}>
        <Icon name="lock" size={12} color="textFaint" />
        <Text variant="caption" color="textFaint">
          {t.onDevice}
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
