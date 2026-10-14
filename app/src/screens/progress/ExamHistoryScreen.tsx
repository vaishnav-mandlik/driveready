import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {BarChart, Card, Chip, EmptyState, Icon, ProgressBar, Screen, Text} from '../../components';
import {getExamConfigs} from '../../data/exams';
import {getTopic} from '../../data/tracks';
import type {TopicId} from '../../data/types';
import {formatDuration} from '../../engine/dates';
import {useLearner} from '../../hooks/useLearner';
import {defineStrings, formatDateTime, useStrings} from '../../i18n';
import type {RootScreenProps} from '../../navigation/types';
import {ExamRecord, useProgress} from '../../store/progress';
import {getSession} from '../../store/session';
import {useTheme} from '../../theme/ThemeProvider';

const STR = defineStrings(
  {
    passedOf: (passed: number, total: number) => `${passed} of ${total} passed`,
    lastAttempts: (n: number) => `Score % of your last ${n} attempt${n === 1 ? '' : 's'}`,
    chartA11y: 'Recent exam scores',
    emptyTitle: 'No exams yet',
    emptyMessage: 'Exam simulations you finish will appear here with your score and weak topics.',
    takeExam: 'Take an exam',
    rowA11y: (title: string, pct: number, passed: boolean) => `${title}, ${pct} percent, ${passed ? 'passed' : 'failed'}`,
    rowHint: 'Shows topic breakdown',
    passed: 'Passed',
    failed: 'Failed',
    details: (title: string, needed: number, endedEarly: boolean, timedOut: boolean) =>
      `${title} · ${needed} needed${endedEarly ? ' · ended once decided' : ''}${timedOut ? ' · time ran out' : ''}`,
    review: 'Review answers',
  },
  {
    passedOf: (passed: number, total: number) => `${passed} de ${total} aprobados`,
    lastAttempts: (n: number) => (n === 1 ? 'Calificación (%) de tu último intento' : `Calificación (%) de tus últimos ${n} intentos`),
    chartA11y: 'Calificaciones recientes de exámenes',
    emptyTitle: 'Aún no hay exámenes',
    emptyMessage: 'Las simulaciones de examen que termines aparecerán aquí con tu calificación y tus temas débiles.',
    takeExam: 'Hacer un examen',
    rowA11y: (title: string, pct: number, passed: boolean) => `${title}, ${pct} por ciento, ${passed ? 'aprobado' : 'reprobado'}`,
    rowHint: 'Muestra el desglose por tema',
    passed: 'Aprobado',
    failed: 'Reprobado',
    details: (title: string, needed: number, endedEarly: boolean, timedOut: boolean) =>
      `${title} · se necesitan ${needed}${endedEarly ? ' · terminó al definirse el resultado' : ''}${timedOut ? ' · se acabó el tiempo' : ''}`,
    review: 'Revisar respuestas',
  },
);

/**
 * An exam record's title in the current language: records store the title in the language the
 * exam was taken in, so look the exam config up again by id (falls back to the stored title).
 */
export function examRecordTitle(exam: ExamRecord): string {
  try {
    return getExamConfigs(exam.track, exam.state).find(c => c.id === exam.examId)?.title ?? exam.title;
  } catch {
    return exam.title;
  }
}

export function ExamHistoryScreen({navigation}: RootScreenProps<'ExamHistory'>) {
  const {colors, spacing} = useTheme();
  const t = useStrings(STR);
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
                {t.passedOf(passed, exams.length)}
              </Text>
              <Text variant="caption" color="textMuted" style={{marginBottom: spacing.md}}>
                {t.lastAttempts(last10.length)}
              </Text>
              <BarChart
                data={last10.map((e, i) => ({label: String(i + 1), value: Math.round((e.correct / Math.max(1, e.total)) * 100), highlight: e.passed}))}
                height={90}
                color={colors.success}
                accessibilityLabel={t.chartA11y}
              />
            </Card>
          ) : undefined
        }
        ListEmptyComponent={
          <EmptyState icon="clipboard-check" title={t.emptyTitle} message={t.emptyMessage} actionLabel={t.takeExam} onAction={() => navigation.navigate('ExamIntro', {})} />
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
  const t = useStrings(STR);
  const pct = Math.round((exam.correct / Math.max(1, exam.total)) * 100);
  const title = examRecordTitle(exam);
  const topics = (Object.entries(exam.byTopic) as [TopicId, [number, number]][]).filter(([, v]) => v && v[1] > 0).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]);
  return (
    <Card>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityLabel={t.rowA11y(title, pct, exam.passed)} accessibilityHint={t.rowHint}>
        <View style={[styles.row, {gap: spacing.md}]}>
          <Icon name={exam.passed ? 'badge-check' : 'circle-x'} color={exam.passed ? colors.success : colors.danger} />
          <View style={styles.flex}>
            <Text variant="bodyStrong">
              {exam.correct}/{exam.total} · {pct}%
            </Text>
            <Text variant="caption" color="textMuted">
              {formatDateTime(exam.at)} · {formatDuration(exam.durationSec)}
            </Text>
          </View>
          <Chip label={exam.passed ? t.passed : t.failed} tone={exam.passed ? 'success' : 'danger'} />
          <Icon name={expanded ? 'chevron-up' : 'chevron-down'} color="textFaint" />
        </View>
      </Pressable>
      {expanded ? (
        <View style={{marginTop: spacing.md, gap: spacing.md}}>
          <Text variant="caption" color="textMuted">
            {t.details(title, exam.passingScore, !!exam.endedEarly, !!exam.timedOut)}
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
              {t.review}
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
