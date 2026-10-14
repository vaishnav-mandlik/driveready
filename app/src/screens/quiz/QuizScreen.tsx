import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {Alert, Modal, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {usePreventRemove} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button, Chip, EmptyState, Icon, IconButton, ProgressBar, Text} from '../../components';
import {CountdownTimer, useDeadline} from '../../components/quiz/Countdown';
import {QuestionTools, ReportLink} from '../../components/quiz/QuestionActions';
import {QuestionCard} from '../../components/quiz/QuestionCard';
import {getBank} from '../../data/bank';
import {topicTitle} from '../../data/tracks';
import {examDecided, QuizSession} from '../../engine/quiz';
import {defineStrings, useStrings} from '../../i18n';
import {haptic, speech} from '../../native';
import type {RootScreenProps} from '../../navigation/types';
import {finishSession, recordInstantAnswer, startSession} from '../../store/actions';
import {useSettings} from '../../store/settings';
import {useTheme} from '../../theme/ThemeProvider';

const AUTO_ADVANCE_MS = 900;
const SPEED_FLASH_MS = 350;

type EmptyKey = 'mistakes' | 'bookmarks' | 'due' | 'hardest' | 'signs' | 'other';

const STR = defineStrings(
  {
    leaveExamTitle: 'Leave the exam?',
    leaveExamMsg: 'This attempt will not be scored or saved.',
    keepGoing: 'Keep going',
    leave: 'Leave',
    pauseMarathonTitle: 'Pause marathon?',
    pauseMarathonMsg: 'Your place is saved — pick up where you left off anytime.',
    pause: 'Pause',
    endSessionTitle: 'End this session?',
    endSessionMsg: 'Your answers so far are already saved to your progress.',
    seeResults: 'See results',
    headerProgress: (n: number, total: number) => `${n} of ${total}`,
    close: 'Close',
    allQuestions: 'All questions',
    submitExamTitle: 'Submit exam?',
    unansweredMsg: (n: number) =>
      `You have ${n} unanswered question${n === 1 ? '' : 's'}. Unanswered questions count as wrong.`,
    review: 'Review',
    submit: 'Submit',
    noQuestionsTitle: 'No questions here yet',
    goBack: 'Go back',
    questionOf: (n: number, total: number) => `Question ${n} of ${total}`,
    correctCount: (n: number) => `${n} correct`,
    outOfLives: (n: number) => `Out of lives — you got ${n} right!`,
    back: 'Back',
    skip: 'Skip',
    next: 'Next',
    nextQuestion: 'Next question',
    speedHint: 'Answer as many as you can before time runs out',
    chooseHint: 'Choose the best answer',
    empty: {
      mistakes: 'You have no mistakes to review. Questions you miss will show up here.',
      bookmarks: 'Save questions with the bookmark button and practice them here.',
      due: 'Nothing is due for review right now. Come back later!',
      hardest: 'Answer some questions first — the ones you miss most will appear here.',
      signs: 'Road sign questions for this test are not available yet.',
      other: 'Questions for your state and test type are being prepared. Try another mode or topic.',
    } as Record<EmptyKey, string>,
    livesLeft: (n: number) => `${n} lives left`,
    answeredOf: (n: number, total: number) => `${n} of ${total} answered`,
    gridCell: (n: number, answered: boolean, flagged: boolean) =>
      `Question ${n}, ${answered ? 'answered' : 'unanswered'}${flagged ? ', flagged' : ''}`,
    submitExam: 'Submit exam',
  },
  {
    leaveExamTitle: '¿Salir del examen?',
    leaveExamMsg: 'Este intento no se calificará ni se guardará.',
    keepGoing: 'Continuar',
    leave: 'Salir',
    pauseMarathonTitle: '¿Pausar el maratón?',
    pauseMarathonMsg: 'Tu lugar queda guardado: retoma donde lo dejaste cuando quieras.',
    pause: 'Pausar',
    endSessionTitle: '¿Terminar esta sesión?',
    endSessionMsg: 'Tus respuestas hasta ahora ya están guardadas en tu progreso.',
    seeResults: 'Ver resultados',
    headerProgress: (n: number, total: number) => `${n} de ${total}`,
    close: 'Cerrar',
    allQuestions: 'Todas las preguntas',
    submitExamTitle: '¿Entregar el examen?',
    unansweredMsg: (n: number) =>
      n === 1
        ? 'Tienes 1 pregunta sin responder. Las preguntas sin responder cuentan como incorrectas.'
        : `Tienes ${n} preguntas sin responder. Las preguntas sin responder cuentan como incorrectas.`,
    review: 'Revisar',
    submit: 'Entregar',
    noQuestionsTitle: 'Aún no hay preguntas aquí',
    goBack: 'Regresar',
    questionOf: (n: number, total: number) => `Pregunta ${n} de ${total}`,
    correctCount: (n: number) => (n === 1 ? '1 correcta' : `${n} correctas`),
    outOfLives: (n: number) => `¡Sin vidas! Acertaste ${n}.`,
    back: 'Atrás',
    skip: 'Omitir',
    next: 'Siguiente',
    nextQuestion: 'Siguiente pregunta',
    speedHint: 'Responde todas las que puedas antes de que se acabe el tiempo',
    chooseHint: 'Elige la mejor respuesta',
    empty: {
      mistakes: 'No tienes errores que repasar. Las preguntas que falles aparecerán aquí.',
      bookmarks: 'Guarda preguntas con el botón de marcador y practícalas aquí.',
      due: 'No hay nada pendiente de repaso por ahora. ¡Vuelve más tarde!',
      hardest: 'Primero responde algunas preguntas: las que más falles aparecerán aquí.',
      signs: 'Aún no hay preguntas de señales de tránsito para este examen.',
      other: 'Estamos preparando las preguntas para tu estado y tipo de examen. Prueba otro modo o tema.',
    } as Record<EmptyKey, string>,
    livesLeft: (n: number) => (n === 1 ? 'Te queda 1 vida' : `Te quedan ${n} vidas`),
    answeredOf: (n: number, total: number) => `${n} de ${total} respondidas`,
    gridCell: (n: number, answered: boolean, flagged: boolean) =>
      `Pregunta ${n}, ${answered ? 'respondida' : 'sin responder'}${flagged ? ', marcada' : ''}`,
    submitExam: 'Entregar examen',
  },
);

export function QuizScreen({navigation, route}: RootScreenProps<'Quiz'>) {
  const {colors, spacing, radius} = useTheme();
  const insets = useSafeAreaInsets();
  const autoAdvance = useSettings(s => s.autoAdvance);
  const realisticExam = useSettings(s => s.realisticExam);
  const t = useStrings(STR);

  const [session, setSession] = useState<QuizSession>(() => startSession(route.params.spec));
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const bank = useMemo(() => getBank(session.track, session.state), [session.track, session.state]);

  const [index, setIndex] = useState(session.startIndex);
  const [revealed, setRevealed] = useState(false);
  const [lives, setLives] = useState(session.lives);
  const [flags, setFlags] = useState<Record<number, true>>({});
  const [gridOpen, setGridOpen] = useState(false);
  const [done, setDone] = useState<null | {sessionId: string; unlocked: string[]; newBest: boolean; previousBest: number}>(null);
  const finishing = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const mode = session.spec.mode;
  const isExam = session.feedback === 'end';
  const total = session.questionIds.length;
  const question = bank.byId.get(session.questionIds[index]);
  const chosen = session.answers[index] ?? null;
  const answeredCount = session.answers.filter(a => a !== null).length;
  const correctSoFar = useMemo(
    () => session.answers.filter((a, i) => a !== null && a === bank.byId.get(session.questionIds[i])?.answer).length,
    [session, bank],
  );
  const deadline = session.timeLimitSec ? session.startedAt + session.timeLimitSec * 1000 : null;

  const finish = useCallback(
    (opts: {endedEarly?: boolean; timedOut?: boolean} = {}) => {
      if (finishing.current) {
        return;
      }
      finishing.current = true;
      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current);
      }
      speech.stop();
      const outcome = finishSession(sessionRef.current, opts);
      setDone({
        sessionId: outcome.session.id,
        unlocked: outcome.unlocked.map(a => a.id),
        newBest: outcome.newBest,
        previousBest: outcome.previousBest,
      });
    },
    [],
  );

  useEffect(
    () => () => {
      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current);
      }
      speech.stop();
    },
    [],
  );

  useDeadline(deadline, !done && total > 0, () => finish({timedOut: true}));

  // ---- leaving -------------------------------------------------------------
  const hasProgress = answeredCount > 0 || isExam;
  usePreventRemove(!done && total > 0 && hasProgress, ({data}) => {
    const leave = () => navigation.dispatch(data.action);
    if (finishing.current) {
      leave(); // the session is over: going to Results must never be blocked
      return;
    }
    if (isExam) {
      Alert.alert(t.leaveExamTitle, t.leaveExamMsg, [
        {text: t.keepGoing, style: 'cancel'},
        {text: t.leave, style: 'destructive', onPress: leave},
      ]);
    } else if (mode === 'marathon') {
      Alert.alert(t.pauseMarathonTitle, t.pauseMarathonMsg, [
        {text: t.keepGoing, style: 'cancel'},
        {text: t.pause, onPress: leave},
      ]);
    } else {
      Alert.alert(t.endSessionTitle, t.endSessionMsg, [
        {text: t.keepGoing, style: 'cancel'},
        {text: t.seeResults, onPress: () => finish({endedEarly: true})},
        {text: t.leave, style: 'destructive', onPress: leave},
      ]);
    }
  });

  // Declared after usePreventRemove so the guard has already been lifted when this runs.
  useEffect(() => {
    if (done) {
      navigation.replace('Results', done);
    }
  }, [done, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: total ? t.headerProgress(Math.min(index + 1, total), total) : session.title,
      headerBackVisible: false,
      headerLeft: () => (
        <IconButton icon="x" accessibilityLabel={t.close} onPress={() => navigation.goBack()} testID="quiz-close" />
      ),
      headerRight: isExam
        ? () => (
            <IconButton icon="grid" accessibilityLabel={t.allQuestions} onPress={() => setGridOpen(true)} testID="quiz-grid" />
          )
        : undefined,
    });
  }, [navigation, index, total, isExam, session.title, t]);

  // ---- moving ----------------------------------------------------------------
  const goTo = useCallback((i: number) => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    speech.stop();
    setIndex(i);
    setRevealed(false);
    scrollRef.current?.scrollTo({y: 0, animated: false});
  }, []);

  const next = useCallback(() => {
    const s = sessionRef.current;
    if (s.spec.mode === 'survival' && (lives ?? 1) <= 0) {
      finish({endedEarly: true});
      return;
    }
    if (index + 1 >= s.questionIds.length) {
      finish();
    } else {
      goTo(index + 1);
    }
  }, [index, lives, finish, goTo]);

  const choose = useCallback(
    (original: number) => {
      if (!question || done) {
        return;
      }
      const s = sessionRef.current;
      if (!isExam && s.answers[index] !== null) {
        return; // instant modes lock the first answer
      }
      const answers = s.answers.slice();
      answers[index] = original;
      const updated: QuizSession = {...s, answers};
      sessionRef.current = updated;
      setSession(updated);

      if (isExam) {
        haptic('selection');
        if (realisticExam && examDecided(updated, bank)) {
          finish({endedEarly: true});
        }
        return;
      }

      const correct = original === question.answer;
      recordInstantAnswer(updated, index, question, original);
      haptic(correct ? 'success' : 'error');
      setRevealed(true);

      if (mode === 'speed') {
        advanceTimer.current = setTimeout(() => {
          if (index + 1 >= updated.questionIds.length) {
            finish();
          } else {
            goTo(index + 1);
          }
        }, SPEED_FLASH_MS);
        return;
      }
      if (mode === 'survival' && !correct) {
        setLives(l => Math.max(0, (l ?? 1) - 1));
        return;
      }
      if (correct && autoAdvance) {
        advanceTimer.current = setTimeout(() => {
          if (index + 1 >= updated.questionIds.length) {
            finish();
          } else {
            goTo(index + 1);
          }
        }, AUTO_ADVANCE_MS);
      }
    },
    [question, done, isExam, index, realisticExam, bank, finish, mode, autoAdvance, goTo],
  );

  const submitExam = useCallback(() => {
    const unanswered = sessionRef.current.answers.filter(a => a === null).length;
    if (unanswered > 0) {
      Alert.alert(
        t.submitExamTitle,
        t.unansweredMsg(unanswered),
        [
          {text: t.review, style: 'cancel', onPress: () => setGridOpen(true)},
          {text: t.submit, onPress: () => finish()},
        ],
      );
    } else {
      finish();
    }
  }, [finish, t]);

  // ---- render -------------------------------------------------------------------
  if (total === 0 || !question) {
    return (
      <View style={[styles.flex, {backgroundColor: colors.background}]}>
        <EmptyState
          icon="clipboard"
          title={t.noQuestionsTitle}
          message={t.empty[emptyKey(mode)]}
          actionLabel={t.goBack}
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  const outOfLives = mode === 'survival' && (lives ?? 1) <= 0;
  const isLast = index + 1 >= total;

  return (
    <View style={[styles.flex, {backgroundColor: colors.background}]} testID="quiz-screen">
      <View style={{paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm}}>
        <ProgressBar
          value={(isExam ? answeredCount : index + (revealed ? 1 : 0)) / total}
          height={6}
          accessibilityLabel={t.questionOf(index + 1, total)}
        />
        <View style={[styles.statusRow, {gap: spacing.sm}]}>
          <Text variant="captionStrong" color="textMuted" style={styles.flex} numberOfLines={1}>
            {session.title}
          </Text>
          {mode === 'survival' ? <Lives lives={lives ?? 0} /> : null}
          {mode === 'speed' ? <Chip label={t.correctCount(correctSoFar)} icon="zap" tone="primary" /> : null}
          {mode === 'marathon' ? (
            <Chip label={`${index + 1}/${total}`} icon="infinity" tone="accent" />
          ) : null}
          {deadline ? <CountdownTimer deadline={deadline} totalSec={session.timeLimitSec ?? 0} paused={!!done} /> : null}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={{padding: spacing.lg, paddingBottom: spacing.xxl}}
        showsVerticalScrollIndicator={false}>
        <QuestionCard
          question={question}
          order={session.orders[index]}
          chosen={chosen}
          revealed={!isExam && revealed}
          showExplanation={mode !== 'speed'}
          onChoose={choose}
          locked={!isExam && revealed}
          framed={false}
          explanationSeed={index}
          eyebrow={<Chip label={topicTitle(question.topic)} tone="neutral" />}
          tools={
            <QuestionTools
              question={question}
              order={session.orders[index]}
              revealed={!isExam && revealed}
              flagged={!!flags[index]}
              onToggleFlag={
                isExam
                  ? () =>
                      setFlags(f => {
                        const copy = {...f};
                        if (copy[index]) {
                          delete copy[index];
                        } else {
                          copy[index] = true;
                        }
                        return copy;
                      })
                  : undefined
              }
            />
          }
          footer={!isExam && revealed ? <ReportLink question={question} /> : null}
        />
        {outOfLives ? (
          <View style={[styles.banner, {backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg}]}>
            <Icon name="heart" size={18} color={colors.danger} />
            <Text variant="bodyStrong" color="danger" style={styles.flex}>
              {t.outOfLives(correctSoFar)}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.background,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.md + insets.bottom,
            gap: spacing.md,
          },
        ]}>
        {isExam ? (
          <>
            <Button
              title={t.back}
              variant="outline"
              icon="chevron-left"
              onPress={() => goTo(index - 1)}
              disabled={index === 0}
              style={styles.flex}
              testID="quiz-prev"
            />
            {isLast ? (
              <Button title={t.submit} icon="check" onPress={submitExam} style={styles.flex2} testID="quiz-submit" />
            ) : (
              <Button
                title={chosen === null ? t.skip : t.next}
                iconRight="chevron-right"
                variant={chosen === null ? 'secondary' : 'primary'}
                onPress={() => goTo(index + 1)}
                style={styles.flex2}
                testID="quiz-next"
              />
            )}
          </>
        ) : revealed && mode !== 'speed' ? (
          <Button
            title={outOfLives || isLast ? t.seeResults : t.nextQuestion}
            iconRight={outOfLives || isLast ? 'flag' : 'arrow-right'}
            onPress={next}
            fullWidth
            style={styles.flex}
            testID="quiz-next"
          />
        ) : (
          <Text variant="caption" color="textFaint" align="center" style={styles.flex}>
            {mode === 'speed' ? t.speedHint : t.chooseHint}
          </Text>
        )}
      </View>

      <QuestionGrid
        visible={gridOpen}
        onClose={() => setGridOpen(false)}
        answers={session.answers}
        flags={flags}
        current={index}
        onJump={i => {
          setGridOpen(false);
          goTo(i);
        }}
        onSubmit={() => {
          setGridOpen(false);
          submitExam();
        }}
      />
    </View>
  );
}

function emptyKey(mode: QuizSession['spec']['mode']): EmptyKey {
  switch (mode) {
    case 'mistakes':
    case 'bookmarks':
    case 'due':
    case 'hardest':
    case 'signs':
      return mode;
    default:
      return 'other';
  }
}

function Lives({lives}: {lives: number}) {
  const {colors} = useTheme();
  const t = useStrings(STR);
  return (
    <View style={styles.lives} accessible accessibilityLabel={t.livesLeft(lives)}>
      {[0, 1, 2].map(i => (
        <Icon key={i} name="heart" size={18} color={i < lives ? colors.danger : colors.border} fill={i < lives ? colors.danger : 'none'} />
      ))}
    </View>
  );
}

function QuestionGrid({
  visible,
  onClose,
  answers,
  flags,
  current,
  onJump,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  answers: (number | null)[];
  flags: Record<number, true>;
  current: number;
  onJump: (i: number) => void;
  onSubmit: () => void;
}) {
  const {colors, spacing, radius} = useTheme();
  const insets = useSafeAreaInsets();
  const answered = answers.filter(a => a !== null).length;
  const t = useStrings(STR);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, {backgroundColor: colors.overlay}]} onPress={onClose} accessibilityLabel={t.close} />
      <View
        style={[
          styles.sheet,
          {backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: spacing.lg + insets.bottom},
        ]}>
        <View style={[styles.statusRow, {marginBottom: spacing.md}]}>
          <Text variant="heading" style={styles.flex} accessibilityRole="header">
            {t.answeredOf(answered, answers.length)}
          </Text>
          <IconButton icon="x" accessibilityLabel={t.close} onPress={onClose} />
        </View>
        <ScrollView style={styles.gridScroll} contentContainerStyle={[styles.grid, {gap: spacing.sm}]}>
          {answers.map((a, i) => {
            const isCurrent = i === current;
            const flagged = !!flags[i];
            return (
              <Pressable
                key={i}
                onPress={() => onJump(i)}
                accessibilityRole="button"
                accessibilityLabel={t.gridCell(i + 1, a !== null, flagged)}
                style={[
                  styles.cell,
                  {
                    borderRadius: radius.md,
                    backgroundColor: a === null ? colors.surfaceAlt : colors.primarySoft,
                    borderColor: isCurrent ? colors.primary : flagged ? colors.warning : 'transparent',
                  },
                ]}>
                <Text variant="bodyStrong" color={a === null ? 'textMuted' : 'primary'}>
                  {i + 1}
                </Text>
                {flagged ? (
                  <View style={styles.flagDot}>
                    <Icon name="flag" size={10} color={colors.warning} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
        <Button title={t.submitExam} icon="check" onPress={onSubmit} style={{marginTop: spacing.lg}} fullWidth />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  flex2: {flex: 2},
  statusRow: {flexDirection: 'row', alignItems: 'center'},
  footer: {flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth},
  banner: {flexDirection: 'row', alignItems: 'center', gap: 8},
  lives: {flexDirection: 'row', gap: 2},
  backdrop: {flex: 1},
  sheet: {maxHeight: '75%'},
  gridScroll: {flexGrow: 0},
  grid: {flexDirection: 'row', flexWrap: 'wrap'},
  cell: {width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 2},
  flagDot: {position: 'absolute', top: 3, right: 4},
});
