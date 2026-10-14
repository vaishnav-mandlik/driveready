import React, {useMemo, useState} from 'react';
import {Alert, Linking, StyleSheet, View} from 'react-native';
import {Button, Card, Chip, Divider, Icon, IconTile, ListRow, Screen, SectionHeader, Text, ToggleRow} from '../../components';
import {getTopic} from '../../data/tracks';
import type {ExamConfig} from '../../data/types';
import {formatDuration} from '../../engine/dates';
import {useLearner, useReadiness} from '../../hooks/useLearner';
import {defineStrings, formatDate, tr, useStrings} from '../../i18n';
import type {RootScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {useSettings} from '../../store/settings';
import {useTheme} from '../../theme/ThemeProvider';

const STR = defineStrings(
  {
    openTitle: 'Open in your browser?',
    opens: (label: string) => `This opens ${label}.`,
    officialSite: 'the official website',
    cancel: 'Cancel',
    open: 'Open',
    openFailed: 'Could not open the link',
    startExam: 'Start exam',
    noQuestions: 'No questions yet',
    chooseTest: 'Choose a test',
    sameFormat: 'Same format as the real test — answers revealed at the end',
    questions: 'questions',
    toPass: 'to pass',
    passingScore: 'passing score',
    minutesShort: (n: number) => `${n}m`,
    timeLimit: 'time limit',
    signsLine: (signs: number, signsNeed: number | null, rulesNeed: number | null | undefined, rulesTotal: number) =>
      `${signs} road-sign questions${signsNeed !== null ? ` — you must get ${signsNeed} right` : ''}${rulesNeed != null ? `, and ${rulesNeed} of ${rulesTotal} on the rules part` : ''}.`,
    officialInfo: 'Official test information',
    officialInfoPage: 'the official test information page',
    passChance: 'Your estimated pass chance: ',
    examSettings: 'Exam settings',
    showTimer: 'Show timer',
    countsDown: (n: number) => `Counts down from ${n} minutes like the real test`,
    noTimeLimit: 'This test has no official time limit',
    endWhenDecided: 'End when result is decided',
    endWhenDecidedSub: 'Many DMV computers stop as soon as you have passed or failed',
    recentAttempts: 'Recent attempts',
    history: 'History',
    passed: 'Passed',
    failed: 'Failed',
  },
  {
    openTitle: '¿Abrir en tu navegador?',
    opens: (label: string) => `Se abrirá ${label}.`,
    officialSite: 'el sitio web oficial',
    cancel: 'Cancelar',
    open: 'Abrir',
    openFailed: 'No se pudo abrir el enlace',
    startExam: 'Comenzar examen',
    noQuestions: 'Aún no hay preguntas',
    chooseTest: 'Elige un examen',
    sameFormat: 'Mismo formato que el examen real; las respuestas se muestran al final',
    questions: 'preguntas',
    toPass: 'para aprobar',
    passingScore: 'calificación mínima',
    minutesShort: (n: number) => `${n} min`,
    timeLimit: 'tiempo límite',
    signsLine: (signs: number, signsNeed: number | null, rulesNeed: number | null | undefined, rulesTotal: number) =>
      `${signs} preguntas de señales de tránsito${signsNeed !== null ? `: debes acertar ${signsNeed}` : ''}${rulesNeed != null ? `, y ${rulesNeed} de ${rulesTotal} en la parte de reglas` : ''}.`,
    officialInfo: 'Información oficial del examen',
    officialInfoPage: 'la página oficial de información del examen',
    passChance: 'Tu probabilidad estimada de aprobar: ',
    examSettings: 'Ajustes del examen',
    showTimer: 'Mostrar cronómetro',
    countsDown: (n: number) => `Cuenta regresiva de ${n} minutos, como en el examen real`,
    noTimeLimit: 'Este examen no tiene tiempo límite oficial',
    endWhenDecided: 'Terminar al decidirse el resultado',
    endWhenDecidedSub: 'Muchas computadoras del DMV se detienen en cuanto apruebas o repruebas',
    recentAttempts: 'Intentos recientes',
    history: 'Historial',
    passed: 'Aprobado',
    failed: 'Reprobado',
  },
);

export function openOfficial(url: string, label?: string) {
  if (!url) {
    return;
  }
  const t = tr(STR);
  Alert.alert(t.openTitle, t.opens(label ?? t.officialSite), [
    {text: t.cancel, style: 'cancel'},
    {text: t.open, onPress: () => Linking.openURL(url).catch(() => Alert.alert(t.openFailed, url))},
  ]);
}

export function ExamIntroScreen({navigation, route}: RootScreenProps<'ExamIntro'>) {
  const {colors, spacing} = useTheme();
  const t = useStrings(STR);
  const learner = useLearner();
  const examTimer = useSettings(s => s.examTimer);
  const realisticExam = useSettings(s => s.realisticExam);
  const update = useSettings(s => s.update);
  const [examId, setExamId] = useState(route.params?.examId ?? learner.exam.id);
  const exam: ExamConfig = learner.exams.find(e => e.id === examId) ?? learner.exam;
  const readiness = useReadiness(exam);
  const history = useProgress(s => s.exams);
  const attempts = useMemo(() => history.filter(h => h.examId === exam.id).slice(0, 3), [history, exam.id]);
  const pool = exam.topic ? learner.bank.byTopic.get(exam.topic)?.length ?? 0 : learner.bank.questions.length;

  return (
    <Screen
      footer={
        <Button
          title={pool ? t.startExam : t.noQuestions}
          icon="play"
          size="lg"
          disabled={!pool}
          onPress={() => navigation.replace('Quiz', {spec: {mode: 'exam', examId: exam.id}})}
          fullWidth
          testID="exam-start"
        />
      }>
      {learner.exams.length > 1 ? (
        <>
          <Text variant="label" color="textMuted">
            {t.chooseTest}
          </Text>
          <View style={[styles.wrap, {gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.lg}]}>
            {learner.exams.map(e => (
              <Chip key={e.id} label={e.topic ? getTopic(e.topic)?.title ?? e.title : e.title} selected={e.id === exam.id} onPress={() => setExamId(e.id)} />
            ))}
          </View>
        </>
      ) : null}

      <Card>
        <View style={[styles.row, {gap: spacing.md}]}>
          <IconTile name="clipboard-check" color={colors.accent} size={48} />
          <View style={styles.flex}>
            <Text variant="heading" accessibilityRole="header">
              {exam.title}
            </Text>
            <Text variant="caption" color="textMuted">
              {t.sameFormat}
            </Text>
          </View>
        </View>
        <View style={[styles.row, {marginTop: spacing.xl}]}>
          <Big value={String(exam.questions)} label={t.questions} />
          <Big value={String(exam.passingScore)} label={t.toPass} />
          <Big value={`${Math.round((exam.passingScore / Math.max(1, exam.questions)) * 100)}%`} label={t.passingScore} />
          {exam.timeLimitMinutes ? <Big value={t.minutesShort(exam.timeLimitMinutes)} label={t.timeLimit} /> : null}
        </View>
        {exam.signs ? (
          <View style={[styles.row, {gap: spacing.sm, marginTop: spacing.lg}]}>
            <Icon name="signpost" size={18} color={colors.warning} />
            <Text variant="bodyStrong" style={styles.flex}>
              {t.signsLine(exam.signs.questions, exam.signs.passingScore, exam.rulesPassingScore, exam.questions - exam.signs.questions)}
            </Text>
          </View>
        ) : null}
        {exam.notes ? (
          <Text variant="caption" color="textMuted" style={{marginTop: spacing.lg}}>
            {exam.notes}
          </Text>
        ) : null}
        {exam.sourceUrl ? (
          <Button title={t.officialInfo} variant="ghost" size="sm" icon="external" onPress={() => openOfficial(exam.sourceUrl ?? '', t.officialInfoPage)} style={styles.left} />
        ) : null}
      </Card>

      <Card variant="tinted" tint={colors.primarySoft} style={[styles.row, {gap: spacing.md, marginTop: spacing.md}]}>
        <Icon name="sparkles" color={colors.primary} />
        <Text variant="body" style={styles.flex}>
          {t.passChance}
          <Text variant="bodyStrong">{Math.round(readiness.passProbability * 100)}%</Text>
        </Text>
      </Card>

      <SectionHeader title={t.examSettings} />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        <ToggleRow
          title={t.showTimer}
          subtitle={exam.timeLimitMinutes ? t.countsDown(exam.timeLimitMinutes) : t.noTimeLimit}
          icon="timer"
          value={examTimer && !!exam.timeLimitMinutes}
          disabled={!exam.timeLimitMinutes}
          onValueChange={v => update({examTimer: v})}
        />
        <Divider />
        <ToggleRow
          title={t.endWhenDecided}
          subtitle={t.endWhenDecidedSub}
          icon="flag"
          value={realisticExam}
          onValueChange={v => update({realisticExam: v})}
        />
      </Card>

      {attempts.length ? (
        <>
          <SectionHeader title={t.recentAttempts} actionLabel={t.history} onAction={() => navigation.navigate('ExamHistory')} />
          <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
            {attempts.map((a, i) => (
              <React.Fragment key={a.id}>
                {i ? <Divider /> : null}
                <ListRow
                  title={`${a.correct}/${a.total} · ${Math.round((a.correct / Math.max(1, a.total)) * 100)}%`}
                  subtitle={`${formatDate(a.at)} · ${formatDuration(a.durationSec)}`}
                  icon={a.passed ? 'badge-check' : 'circle-x'}
                  iconColor={a.passed ? colors.success : colors.danger}
                  value={a.passed ? t.passed : t.failed}
                />
              </React.Fragment>
            ))}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

function Big({value, label}: {value: string; label: string}) {
  return (
    <View style={styles.big}>
      <Text variant="title">{value}</Text>
      <Text variant="caption" color="textMuted" align="center">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  wrap: {flexDirection: 'row', flexWrap: 'wrap'},
  big: {flex: 1, alignItems: 'center'},
  left: {alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 0},
});
