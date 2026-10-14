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
import {readinessLabelText} from '../../engine/readiness';
import {useReadiness} from '../../hooks/useLearner';
import {defineStrings, useStrings} from '../../i18n';
import type {RootScreenProps} from '../../navigation/types';
import {getSession} from '../../store/session';
import {useTheme} from '../../theme/ThemeProvider';

const TIER_COLOR = {bronze: '#C07A3B', silver: '#8D99AE', gold: '#E0A100'} as const;

const STR = defineStrings(
  {
    unavailableTitle: 'Results unavailable',
    unavailableMsg: 'These results are no longer in memory. Your progress and exam history are saved.',
    done: 'Done',
    passed: 'You passed!',
    notQuite: 'Not quite — keep going',
    newBest: 'New personal best!',
    runComplete: 'Run complete',
    timesUp: 'Time’s up!',
    excellent: 'Excellent work!',
    nice: 'Nice progress!',
    keepPracticing: 'Keep practicing',
    examSubline: (correct: number, total: number, need: number | null, endedEarly: boolean, timedOut: boolean) =>
      `${correct} of ${total} correct · ${need} needed to pass${endedEarly ? ' · test ended once the result was decided' : ''}${timedOut ? ' · time ran out' : ''}`,
    runSubline: (correct: number, best: number) =>
      `${correct} correct answer${correct === 1 ? '' : 's'}${best ? ` · best ${best}` : ''}`,
    practiceSubline: (correct: number, answered: number) => `${correct} of ${answered} answered correctly`,
    shareExam: (passed: boolean, title: string, correct: number, total: number, pct: number) =>
      `I ${passed ? 'passed' : 'took'} the ${title} practice exam in DriveReady: ${correct}/${total} (${pct}%). Free DMV practice tests for every state.`,
    sharePractice: (title: string, correct: number, answered: number) =>
      `I scored ${correct}/${answered} on a ${title} in DriveReady — free DMV practice tests for every state.`,
    newExam: 'New exam',
    practiceAgain: 'Practice again',
    scoreA11y: (pct: number) => `Score ${pct} percent`,
    failTip: 'Review your mistakes below, then try again — most people pass after a few practice exams.',
    correct: 'Correct',
    wrong: 'Wrong',
    time: 'Time',
    testParts: 'Test parts',
    roadSigns: 'Road signs',
    rules: 'Rules of the road',
    need: (n: number) => ` (need ${n})`,
    eachPart: 'Your overall score was high enough, but each part must be passed on its own.',
    unansweredWrong: (n: number) => `${n} unanswered question${n === 1 ? '' : 's'} counted as wrong.`,
    achievementsUnlocked: 'Achievements unlocked',
    byTopic: 'By topic',
    chanceBefore: 'Estimated chance to pass the real test: ',
    chanceAfter: (label: string) => ` (${label.toLowerCase()}).`,
    reviewAnswers: 'Review answers',
    weakest: (topic: string) => `Practice your weakest topic: ${topic}`,
    retry: (n: number) => `Retry ${n} missed question${n === 1 ? '' : 's'}`,
    retryTitle: 'Retry Missed',
    shareScore: 'Share score',
  },
  {
    unavailableTitle: 'Resultados no disponibles',
    unavailableMsg: 'Estos resultados ya no están en memoria. Tu progreso y tu historial de exámenes están guardados.',
    done: 'Listo',
    passed: '¡Aprobaste!',
    notQuite: 'Todavía no, ¡sigue intentándolo!',
    newBest: '¡Nuevo récord personal!',
    runComplete: 'Partida terminada',
    timesUp: '¡Se acabó el tiempo!',
    excellent: '¡Excelente trabajo!',
    nice: '¡Buen progreso!',
    keepPracticing: 'Sigue practicando',
    examSubline: (correct: number, total: number, need: number | null, endedEarly: boolean, timedOut: boolean) =>
      `${correct} de ${total} correctas · se necesitan ${need} para aprobar${endedEarly ? ' · el examen terminó al decidirse el resultado' : ''}${timedOut ? ' · se acabó el tiempo' : ''}`,
    runSubline: (correct: number, best: number) =>
      `${correct === 1 ? '1 respuesta correcta' : `${correct} respuestas correctas`}${best ? ` · récord ${best}` : ''}`,
    practiceSubline: (correct: number, answered: number) => `${correct} de ${answered} respondidas correctamente`,
    shareExam: (passed: boolean, title: string, correct: number, total: number, pct: number) =>
      `${passed ? 'Aprobé' : 'Presenté'} el examen de práctica “${title}” en DriveReady: ${correct}/${total} (${pct}%). Exámenes de práctica del DMV gratis para todos los estados.`,
    sharePractice: (title: string, correct: number, answered: number) =>
      `Saqué ${correct}/${answered} en “${title}” con DriveReady: exámenes de práctica del DMV gratis para todos los estados.`,
    newExam: 'Nuevo examen',
    practiceAgain: 'Practicar otra vez',
    scoreA11y: (pct: number) => `Calificación: ${pct} por ciento`,
    failTip: 'Repasa tus errores abajo y vuelve a intentarlo: la mayoría aprueba después de algunos exámenes de práctica.',
    correct: 'Correctas',
    wrong: 'Incorrectas',
    time: 'Tiempo',
    testParts: 'Partes del examen',
    roadSigns: 'Señales de tránsito',
    rules: 'Reglas de tránsito',
    need: (n: number) => (n === 1 ? ' (se necesita 1)' : ` (se necesitan ${n})`),
    eachPart: 'Tu calificación total fue suficiente, pero cada parte debe aprobarse por separado.',
    unansweredWrong: (n: number) =>
      n === 1 ? '1 pregunta sin responder contó como incorrecta.' : `${n} preguntas sin responder contaron como incorrectas.`,
    achievementsUnlocked: 'Logros desbloqueados',
    byTopic: 'Por tema',
    chanceBefore: 'Probabilidad estimada de aprobar el examen real: ',
    chanceAfter: (label: string) => ` (${label.toLowerCase()}).`,
    reviewAnswers: 'Revisar respuestas',
    weakest: (topic: string) => `Practica tu tema más débil: ${topic}`,
    retry: (n: number) => (n === 1 ? 'Repetir 1 pregunta fallada' : `Repetir ${n} preguntas falladas`),
    retryTitle: 'Repetir falladas',
    shareScore: 'Compartir resultado',
  },
);

export function ResultsScreen({navigation, route}: RootScreenProps<'Results'>) {
  const {colors, spacing} = useTheme();
  const t = useStrings(STR);
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
          title={t.unavailableTitle}
          message={t.unavailableMsg}
          actionLabel={t.done}
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
      ? t.passed
      : t.notQuite
    : mode === 'survival'
      ? newBest
        ? t.newBest
        : t.runComplete
      : mode === 'speed'
        ? newBest
          ? t.newBest
          : t.timesUp
        : pct >= 90
          ? t.excellent
          : pct >= 70
            ? t.nice
            : t.keepPracticing;

  const subline = isExam
    ? t.examSubline(result.correct, result.total, result.passingScore, session.endedEarly, session.timedOut)
    : mode === 'survival' || mode === 'speed'
      ? t.runSubline(result.correct, previousBest && !newBest ? previousBest : 0)
      : t.practiceSubline(result.correct, result.answered);

  const topics = (Object.entries(result.byTopic) as [TopicId, [number, number]][])
    .filter(([, v]) => v && v[1] > 0)
    .sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]);

  const weakestTopic = topics.find(([, [c, n]]) => n >= 2 && c / n < 0.8)?.[0];

  const share = () =>
    Share.share({
      message: isExam
        ? t.shareExam(passed, session.title, result.correct, result.total, pct)
        : t.sharePractice(session.title, result.correct, result.answered),
    });

  return (
    <Screen
      footer={
        <View style={[styles.row, {gap: spacing.md}]}>
          <Button title={t.done} variant="outline" onPress={() => navigation.navigate('Tabs')} style={styles.flex} testID="results-done" />
          <Button
            title={isExam ? t.newExam : t.practiceAgain}
            icon="repeat"
            onPress={() => navigation.replace('Quiz', {spec: session.spec.mode === 'custom' ? {...session.spec} : {...session.spec, questionIds: undefined}})}
            style={styles.flex2}
            testID="results-again"
          />
        </View>
      }>
      <Card style={styles.center}>
        <ProgressRing value={result.total ? result.correct / result.total : 0} size={150} stroke={12} color={accent} accessibilityLabel={t.scoreA11y(pct)}>
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
            {t.failTip}
          </Text>
        ) : null}
      </Card>

      <View style={[styles.row, {gap: spacing.md, marginTop: spacing.md}]}>
        <StatTile label={t.correct} value={String(result.correct)} icon="circle-check" tone="success" />
        <StatTile label={t.wrong} value={String(result.wrong)} icon="circle-x" tone="danger" />
        <StatTile label={t.time} value={formatDuration(result.durationSec)} icon="clock" tone="primary" />
      </View>
      {result.sections ? (
        <Card style={{marginTop: spacing.md, gap: spacing.sm}}>
          <Text variant="label" color="textMuted">
            {t.testParts}
          </Text>
          {(
            [
              [t.roadSigns, result.sections.signs],
              [t.rules, result.sections.rules],
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
                  {sec.need !== null ? t.need(sec.need) : ''}
                </Text>
              </View>
            );
          })}
          {result.passed === false && result.passingScore !== null && result.correct >= result.passingScore ? (
            <Text variant="caption" color="danger">
              {t.eachPart}
            </Text>
          ) : null}
        </Card>
      ) : null}
      {result.skipped > 0 && isExam ? (
        <Text variant="caption" color="textMuted" style={{marginTop: spacing.sm}}>
          {t.unansweredWrong(result.skipped)}
        </Text>
      ) : null}

      {unlocked.length ? (
        <>
          <SectionHeader title={t.achievementsUnlocked} />
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
          <SectionHeader title={t.byTopic} />
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
            {t.chanceBefore}
            <Text variant="bodyStrong">{Math.round(readiness.passProbability * 100)}%</Text>
            {t.chanceAfter(readinessLabelText(readiness.label))}
          </Text>
        </Card>
      ) : null}

      <View style={{gap: spacing.md, marginTop: spacing.xl}}>
        <Button title={t.reviewAnswers} variant="secondary" icon="list-checks" onPress={() => navigation.navigate('Review', {sessionId: session.id})} fullWidth testID="results-review" />
        {weakestTopic ? (
          <Button
            title={t.weakest(getTopic(weakestTopic)?.title ?? topicTitle(weakestTopic))}
            variant="outline"
            icon="target"
            onPress={() => navigation.replace('Topic', {topic: weakestTopic})}
            fullWidth
          />
        ) : null}
        {result.wrongIds.length ? (
          <Button
            title={t.retry(result.wrongIds.length)}
            variant="outline"
            icon="reset"
            onPress={() => navigation.replace('Quiz', {spec: {mode: 'custom', title: t.retryTitle, questionIds: result.wrongIds}})}
            fullWidth
            testID="results-retry"
          />
        ) : null}
        <Button title={t.shareScore} variant="ghost" icon="share" onPress={share} fullWidth />
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
