import React, {useMemo} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Button, Card, Chip, Icon, IconButton, ListRow, ProgressBar, ProgressRing, ReadyChecklist, Screen, SectionHeader, Text, Divider} from '../../components';
import {getTopic} from '../../data/tracks';
import type {TopicId} from '../../data/types';
import {currentStreak, dayKey, daysUntil} from '../../engine/dates';
import {readinessLabelText} from '../../engine/readiness';
import {activeDayMap} from '../../engine/stats';
import {useLearner, useReadiness} from '../../hooks/useLearner';
import {defineStrings, useStrings} from '../../i18n';
import type {TabScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {useSettings} from '../../store/settings';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {formatCount, greeting} from '../practice/shared/format';
import {useDailyChallengeDone, useModeCounts, useNow, usePersonalBest} from '../practice/shared/hooks';
import {latestMarathon, questionOfTheDay} from '../practice/shared/practiceData';
import {ModeTile, TileGrid} from '../practice/shared/ui';

const STR = defineStrings(
  {
    greetingName: (greet: string, name: string) => `${greet}, ${name}`,
    changeState: (state: string, track: string) => `${state}, ${track}. Change state`,
    changeTrack: (track: string) => `Test type: ${track}. Change`,
    settings: 'Settings',
    emptyTitle: 'Questions are on the way',
    emptyBody: (track: string, state: string) =>
      `We’re finishing the ${track} question bank for ${state}. Check the State Cheat Sheet and road signs meanwhile.`,
    chanceA11y: (pct: number) => `Estimated pass chance ${pct} percent`,
    chancePending: 'Pass chance appears after 10 answers',
    passChance: 'pass chance',
    letsStart: 'Let’s get started',
    keepGoing: 'Keep going',
    practicedSummary: (seen: number, total: number, mastered: number) => `${seen} of ${total} questions practiced · ${mastered} mastered`,
    answerMore: (left: number, total: number) =>
      `Answer ${left} more question${left === 1 ? '' : 's'} to see your pass chance · ${total} questions in your bank`,
    takeExam: 'Take a practice exam',
    today: 'Today',
    dailyGoalA11y: 'Daily goal progress',
    streak: 'Streak',
    streakDays: (n: number) => (n === 1 ? '1 day' : `${formatCount(n)} days`),
    studiedToday: 'Studied today',
    keepStreak: 'Study today to keep it',
    startStreak: 'Start one today',
    continueMarathon: 'Continue marathon',
    practiceWeakest: (topic: string) => `Practice weakest topic ${topic}`,
    continue: 'Continue',
    startHere: 'Start here',
    focusArea: 'Focus area',
    marathon: 'Marathon',
    marathonTopic: (topic: string) => `Marathon · ${topic}`,
    study: 'Study',
    practiceTest: 'Practice test',
    smartQuestions: '20 smart questions',
    examSimulator: 'Exam simulator',
    examSummary: (questions: number, pass: number) => `${questions} Q · pass ${pass}`,
    mistakes: 'Mistakes',
    toFix: (n: number) => `${n} to fix`,
    noneYet: 'None yet',
    roadSigns: 'Road signs',
    signQuestions: (n: number) => `${n} sign questions`,
    signLibrary: 'Sign library',
    dailyChallenge: 'Daily challenge',
    doneToday: 'Done for today',
    tenQuestions: '10 questions',
    smartReview: 'Smart review',
    dueNow: (n: number) => `${n} due now`,
    nothingDue: 'Nothing due',
    survival: 'Survival',
    best: (n: number) => `Best: ${n}`,
    threeLives: '3 lives',
    speedRound: 'Speed round',
    twoMinutes: '2 minutes',
    openPlan: 'Open study plan',
    dayUnit: (n: number): string => (n === 1 ? 'day' : 'days'),
    testToday: 'Your test is today — good luck!',
    untilTest: 'Until your test',
    seePlan: 'See your day-by-day study plan',
    qotd: 'Question of the day',
    qotdA11y: (prompt: string) => `Question of the day: ${prompt}`,
    tapToAnswer: 'Tap to answer',
    resources: 'Resources',
    cheatSheet: (state: string) => `${state} cheat sheet`,
    cheatSheetSub: 'Key numbers and rules, verified',
    aboutTest: 'About your test',
    aboutTestSub: (questions: number, pass: number) => `${questions} questions · ${pass} to pass`,
    drivingLog: 'Driving log',
    drivingLogSub: 'Track supervised practice hours',
  },
  {
    greetingName: (greet: string, name: string) => `${greet}, ${name}`,
    changeState: (state: string, track: string) => `${state}, ${track}. Cambiar estado`,
    changeTrack: (track: string) => `Tipo de examen: ${track}. Cambiar`,
    settings: 'Ajustes',
    emptyTitle: 'Las preguntas vienen en camino',
    emptyBody: (track: string, state: string) =>
      `Estamos terminando el banco de preguntas de ${track} para ${state}. Mientras tanto, revisa la hoja de repaso del estado y las señales de tránsito.`,
    chanceA11y: (pct: number) => `Probabilidad estimada de aprobar: ${pct} por ciento`,
    chancePending: 'La probabilidad de aprobar aparece después de 10 respuestas',
    passChance: 'prob. de aprobar',
    letsStart: '¡Comencemos!',
    keepGoing: 'Sigue así',
    practicedSummary: (seen: number, total: number, mastered: number) =>
      `${seen} de ${total} preguntas practicadas · ${mastered} ${mastered === 1 ? 'dominada' : 'dominadas'}`,
    answerMore: (left: number, total: number) =>
      `${left === 1 ? 'Responde 1 pregunta más' : `Responde ${left} preguntas más`} para ver tu probabilidad de aprobar · ${total} preguntas en tu banco`,
    takeExam: 'Hacer un examen de práctica',
    today: 'Hoy',
    dailyGoalA11y: 'Progreso de la meta diaria',
    streak: 'Racha',
    streakDays: (n: number) => (n === 1 ? '1 día' : `${formatCount(n)} días`),
    studiedToday: 'Estudiaste hoy',
    keepStreak: 'Estudia hoy para mantenerla',
    startStreak: 'Empieza una hoy',
    continueMarathon: 'Continuar maratón',
    practiceWeakest: (topic: string) => `Practicar tu tema más débil: ${topic}`,
    continue: 'Continuar',
    startHere: 'Empieza aquí',
    focusArea: 'Área de enfoque',
    marathon: 'Maratón',
    marathonTopic: (topic: string) => `Maratón · ${topic}`,
    study: 'Estudiar',
    practiceTest: 'Examen de práctica',
    smartQuestions: '20 preguntas inteligentes',
    examSimulator: 'Simulador de examen',
    examSummary: (questions: number, pass: number) => `${questions} preg. · aprueba con ${pass}`,
    mistakes: 'Errores',
    toFix: (n: number) => `${n} por corregir`,
    noneYet: 'Ninguno aún',
    roadSigns: 'Señales de tránsito',
    signQuestions: (n: number) => (n === 1 ? '1 pregunta de señales' : `${n} preguntas de señales`),
    signLibrary: 'Catálogo de señales',
    dailyChallenge: 'Reto diario',
    doneToday: 'Listo por hoy',
    tenQuestions: '10 preguntas',
    smartReview: 'Repaso inteligente',
    dueNow: (n: number) => (n === 1 ? '1 pendiente' : `${n} pendientes`),
    nothingDue: 'Nada pendiente',
    survival: 'Supervivencia',
    best: (n: number) => `Récord: ${n}`,
    threeLives: '3 vidas',
    speedRound: 'Ronda rápida',
    twoMinutes: '2 minutos',
    openPlan: 'Abrir plan de estudio',
    dayUnit: (n: number) => (n === 1 ? 'día' : 'días'),
    testToday: 'Tu examen es hoy. ¡Buena suerte!',
    untilTest: 'Para tu examen',
    seePlan: 'Mira tu plan de estudio día por día',
    qotd: 'Pregunta del día',
    qotdA11y: (prompt: string) => `Pregunta del día: ${prompt}`,
    tapToAnswer: 'Toca para responder',
    resources: 'Recursos',
    cheatSheet: (state: string) => `Hoja de repaso de ${state}`,
    cheatSheetSub: 'Números y reglas clave, verificados',
    aboutTest: 'Sobre tu examen',
    aboutTestSub: (questions: number, pass: number) => `${questions} preguntas · ${pass} para aprobar`,
    drivingLog: 'Registro de manejo',
    drivingLogSub: 'Anota tus horas de práctica supervisada',
  },
);

export function HomeScreen({navigation}: TabScreenProps<'Home'>) {
  const {colors, spacing, radius} = useTheme();
  const t = useStrings(STR);
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
  const validTopics = useMemo(() => new Set<TopicId>(trackMeta.topics.map(tp => tp.id)), [trackMeta]);
  const marathon = useMemo(() => latestMarathon(marathons, track, state, validTopics), [marathons, track, state, validTopics]);
  const until = examDate ? daysUntil(examDate, now) : null;
  const hasSupervisedHours = stateInfo.facts.some(f => f.key === 'supervised_driving_hours');
  const pct = Math.round(readiness.passProbability * 100);
  // A pass estimate from a handful of answers is noise; wait for 10.
  const hasEstimate = readiness.seen >= 10;
  const empty = bank.questions.length === 0;
  const isNew = readiness.seen === 0;
  const firstTopic = trackMeta.topics.find(tp => (bank.byTopic.get(tp.id)?.length ?? 0) > 0);
  const weakest = isNew ? firstTopic : readiness.weakest ? getTopic(readiness.weakest.topic) : undefined;

  return (
    <Screen edges={['top']}>
      <View style={[styles.row, {marginBottom: spacing.lg, gap: spacing.md}]}>
        <View style={styles.flex}>
          <Text variant="captionStrong" color="textMuted">
            {name ? t.greetingName(greeting(new Date(now).getHours()), name) : greeting(new Date(now).getHours())}
          </Text>
          <Pressable
            onPress={() => navigation.navigate('PickState', {mode: 'change'})}
            accessibilityRole="button"
            accessibilityLabel={t.changeState(stateInfo.name, trackMeta.title)}
            style={[styles.row, {gap: 6}]}>
            <Text variant="title" numberOfLines={1} style={styles.shrink} accessibilityRole="header">
              {stateInfo.name}
            </Text>
            <Icon name="chevron-down" size={20} color="textMuted" />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('PickTrack', {mode: 'change'})} accessibilityRole="button" accessibilityLabel={t.changeTrack(trackMeta.title)}>
            <Chip label={trackMeta.license} icon={trackMeta.icon} tone="primary" />
          </Pressable>
        </View>
        <IconButton icon="settings" accessibilityLabel={t.settings} onPress={() => navigation.navigate('Settings')} background={colors.surface} testID="home-settings" />
      </View>

      {empty ? (
        <Card variant="tinted" tint={colors.warningSoft} style={{marginBottom: spacing.md}}>
          <Text variant="bodyStrong">{t.emptyTitle}</Text>
          <Text variant="caption" color="textMuted">
            {t.emptyBody(trackMeta.short, stateInfo.name)}
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
            accessibilityLabel={hasEstimate ? t.chanceA11y(pct) : t.chancePending}>
            <Text variant="title" color="#FFFFFF">
              {hasEstimate ? `${pct}%` : '\u2013'}
            </Text>
            <Text variant="caption" color="#E2ECFF">
              {t.passChance}
            </Text>
          </ProgressRing>
          <View style={styles.flex}>
            <Text variant="heading" color="#FFFFFF">
              {hasEstimate ? readinessLabelText(readiness.label) : isNew ? t.letsStart : t.keepGoing}
            </Text>
            <Text variant="caption" color="#E2ECFF" style={{marginTop: 4}}>
              {hasEstimate
                ? t.practicedSummary(readiness.seen, readiness.total, readiness.mastered)
                : t.answerMore(10 - readiness.seen, readiness.total)}
            </Text>
          </View>
        </View>
        <Button
          title={t.takeExam}
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
              {t.today}
            </Text>
          </View>
          <Text variant="heading" style={{marginTop: spacing.xs}}>
            {Math.min(todayCount, 999)}/{dailyGoal}
          </Text>
          <ProgressBar value={todayCount / Math.max(1, dailyGoal)} height={6} color={todayCount >= dailyGoal ? colors.success : colors.primary} style={{marginTop: spacing.sm}} accessibilityLabel={t.dailyGoalA11y} />
        </Card>
        <Card style={styles.flex}>
          <View style={[styles.row, {gap: 6}]}>
            <Icon name="flame" size={18} color={streak ? colors.warning : colors.textFaint} />
            <Text variant="captionStrong" color="textMuted">
              {t.streak}
            </Text>
          </View>
          <Text variant="heading" style={{marginTop: spacing.xs}}>
            {t.streakDays(streak)}
          </Text>
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {todayCount > 0 ? t.studiedToday : streak ? t.keepStreak : t.startStreak}
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
          accessibilityLabel={marathon ? t.continueMarathon : t.practiceWeakest(weakest?.title ?? '')}>
          <View style={[styles.row, {gap: spacing.md}]}>
            <View style={[styles.circle, {backgroundColor: colors.accentSoft}]}>
              <Icon name={marathon ? 'infinity' : 'trending'} color={colors.accent} />
            </View>
            <View style={styles.flex}>
              <Text variant="captionStrong" color="textMuted">
                {marathon ? t.continue : isNew ? t.startHere : t.focusArea}
              </Text>
              <Text variant="bodyStrong" numberOfLines={1}>
                {marathon
                  ? `${marathon.topic ? t.marathonTopic(getTopic(marathon.topic)?.title ?? '') : t.marathon} — ${marathon.state.index}/${marathon.state.ids.length}`
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

      <SectionHeader title={t.study} />
      <TileGrid>
        <ModeTile title={t.practiceTest} subtitle={t.smartQuestions} icon="target" color={hueAt(colors, 0)} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'practice'}})} disabled={empty} testID="tile-practice" />
        <ModeTile title={t.examSimulator} subtitle={t.examSummary(learner.exam.questions, learner.exam.passingScore)} icon="clipboard-check" color={hueAt(colors, 3)} onPress={() => navigation.navigate('ExamIntro', {})} disabled={empty} />
        <ModeTile title={t.mistakes} subtitle={counts.mistakes ? t.toFix(counts.mistakes) : t.noneYet} icon="circle-x" color={hueAt(colors, 4)} badge={counts.mistakes} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'mistakes'}})} disabled={!counts.mistakes} />
        <ModeTile title={t.roadSigns} subtitle={counts.signs ? t.signQuestions(counts.signs) : t.signLibrary} icon="signpost" color={hueAt(colors, 2)} onPress={() => (counts.signs ? navigation.navigate('Quiz', {spec: {mode: 'signs'}}) : navigation.navigate('Tabs', {screen: 'Signs'}))} />
        <ModeTile title={t.dailyChallenge} subtitle={dailyDone ? t.doneToday : t.tenQuestions} icon="calendar" color={hueAt(colors, 1)} done={dailyDone} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'daily'}})} disabled={empty} />
        <ModeTile title={t.smartReview} subtitle={counts.due ? t.dueNow(counts.due) : t.nothingDue} icon="brain" color={hueAt(colors, 5)} badge={counts.due} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'due'}})} disabled={!counts.due} />
        <ModeTile title={t.survival} subtitle={bestSurvival ? t.best(bestSurvival) : t.threeLives} icon="heart" color={hueAt(colors, 6)} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'survival'}})} disabled={empty} />
        <ModeTile title={t.speedRound} subtitle={bestSpeed ? t.best(bestSpeed) : t.twoMinutes} icon="zap" color={hueAt(colors, 2)} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'speed'}})} disabled={empty} />
      </TileGrid>

      {until !== null && until >= 0 ? (
        <Card style={{marginTop: spacing.md}} onPress={() => navigation.navigate('StudyPlan')} accessibilityLabel={t.openPlan}>
          <View style={[styles.row, {gap: spacing.md}]}>
            <View style={[styles.countdown, {backgroundColor: colors.primarySoft, borderRadius: radius.md}]}>
              <Text variant="title" color="primary">
                {until}
              </Text>
              <Text variant="caption" color="primary">
                {t.dayUnit(until)}
              </Text>
            </View>
            <View style={styles.flex}>
              <Text variant="bodyStrong">{until === 0 ? t.testToday : t.untilTest}</Text>
              <Text variant="caption" color="textMuted">
                {t.seePlan}
              </Text>
            </View>
            <Icon name="chevron-right" color="textFaint" />
          </View>
        </Card>
      ) : null}

      {qotd ? (
        <>
          <SectionHeader title={t.qotd} />
          <Card onPress={() => navigation.navigate('QuestionDetail', {id: qotd.question.id})} accessibilityLabel={t.qotdA11y(qotd.question.prompt)}>
            <View style={[styles.row, {gap: spacing.sm, marginBottom: spacing.sm}]}>
              <Icon name="lightbulb" size={18} color={colors.warning} />
              <Text variant="captionStrong" color="textMuted">
                {getTopic(qotd.question.topic)?.title}
              </Text>
            </View>
            <Text variant="subheading">{qotd.question.prompt}</Text>
            <Text variant="captionStrong" color="primary" style={{marginTop: spacing.md}}>
              {t.tapToAnswer}
            </Text>
          </Card>
        </>
      ) : null}

      <SectionHeader title={t.resources} />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        <ListRow title={t.cheatSheet(stateInfo.name)} subtitle={t.cheatSheetSub} icon="file" iconColor={hueAt(colors, 0)} onPress={() => navigation.navigate('CheatSheet')} />
        <Divider />
        <ListRow title={t.aboutTest} subtitle={t.aboutTestSub(learner.exam.questions, learner.exam.passingScore)} icon="info" iconColor={hueAt(colors, 5)} onPress={() => navigation.navigate('ExamInfo')} />
        {track === 'car' && hasSupervisedHours ? (
          <>
            <Divider />
            <ListRow title={t.drivingLog} subtitle={t.drivingLogSub} icon="car-front" iconColor={hueAt(colors, 1)} onPress={() => navigation.navigate('DriveLog')} />
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
