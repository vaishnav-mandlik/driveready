import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Icon, IconButton, IconTile, LargeHeader, Screen, SectionHeader, Text} from '../../components';
import type {TopicMeta} from '../../data/tracks';
import {useLearner} from '../../hooks/useLearner';
import {defineStrings, useStrings} from '../../i18n';
import type {TabScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {percent} from './shared/format';
import {useDailyChallengeDone, useModeCounts, useNow, usePersonalBest, useTopicProgress} from './shared/hooks';
import {marathonFor, TopicProgress} from './shared/practiceData';
import {MasteryBar, ModeTile, TileGrid} from './shared/ui';

const STR = defineStrings(
  {
    title: 'Practice',
    subtitle: (state: string, track: string, n: number) => `${state} · ${track} · ${n} questions`,
    search: 'Search questions',
    practiceTest: 'Practice test',
    practiceTestSub: '20 adaptive questions',
    exam: 'Exam simulator',
    examSub: (n: number) => `${n} Q · real format`,
    marathon: 'Marathon',
    resume: (index: number, total: number) => `Resume ${index}/${total}`,
    allQuestions: (n: number) => `All ${n} questions`,
    stateLaws: (state: string) => `${state} laws`,
    stateLawsQuizTitle: (state: string) => `${state} Laws`,
    stateOnly: (n: number) => `${n} state-only questions`,
    comingSoon: 'Coming soon',
    mistakes: 'Mistakes',
    toFix: (n: number) => `${n} to fix`,
    noneYet: 'None yet',
    smartReview: 'Smart review',
    dueNow: (n: number) => `${n} due now`,
    nothingDue: 'Nothing due',
    saved: 'Saved',
    savedCount: (n: number) => `${n} questions`,
    bookmarkQuestions: 'Bookmark questions',
    hardest: 'Hardest',
    hardestSub: 'Your most-missed',
    roadSigns: 'Road signs',
    questions: (n: number) => `${n} questions`,
    daily: 'Daily challenge',
    dailyDone: 'Done for today',
    dailySub: '10 questions',
    survival: 'Survival',
    best: (n: number) => `Best: ${n}`,
    survivalSub: '3 lives — how far?',
    speed: 'Speed round',
    speedSub: '2 minutes',
    flashcards: 'Flashcards',
    flashcardsSub: 'Learn the signs',
    cdlTests: 'CDL tests',
    topics: 'Topics',
    topicA11y: (title: string, total: number, seen: number) => `${title}. ${total} questions. ${seen} practiced.`,
    topicProgress: (seen: number, total: number, accuracy: string) => `${seen}/${total} practiced · ${accuracy} correct`,
  },
  {
    title: 'Práctica',
    subtitle: (state: string, track: string, n: number) => `${state} · ${track} · ${n === 1 ? '1 pregunta' : `${n} preguntas`}`,
    search: 'Buscar preguntas',
    practiceTest: 'Examen de práctica',
    practiceTestSub: '20 preguntas adaptativas',
    exam: 'Simulador de examen',
    examSub: (n: number) => `${n} preg. · formato real`,
    marathon: 'Maratón',
    resume: (index: number, total: number) => `Continuar ${index}/${total}`,
    allQuestions: (n: number) => `Las ${n} preguntas`,
    stateLaws: (state: string) => `Leyes de ${state}`,
    stateLawsQuizTitle: (state: string) => `Leyes de ${state}`,
    stateOnly: (n: number) => (n === 1 ? '1 pregunta estatal' : `${n} preguntas estatales`),
    comingSoon: 'Próximamente',
    mistakes: 'Errores',
    toFix: (n: number) => (n === 1 ? '1 por corregir' : `${n} por corregir`),
    noneYet: 'Aún ninguno',
    smartReview: 'Repaso inteligente',
    dueNow: (n: number) => (n === 1 ? '1 pendiente' : `${n} pendientes`),
    nothingDue: 'Nada pendiente',
    saved: 'Guardadas',
    savedCount: (n: number) => (n === 1 ? '1 pregunta' : `${n} preguntas`),
    bookmarkQuestions: 'Guarda preguntas',
    hardest: 'Más difíciles',
    hardestSub: 'Las que más fallas',
    roadSigns: 'Señales de tránsito',
    questions: (n: number) => (n === 1 ? '1 pregunta' : `${n} preguntas`),
    daily: 'Reto diario',
    dailyDone: 'Listo por hoy',
    dailySub: '10 preguntas',
    survival: 'Supervivencia',
    best: (n: number) => `Récord: ${n}`,
    survivalSub: '3 vidas: ¿hasta dónde llegas?',
    speed: 'Ronda rápida',
    speedSub: '2 minutos',
    flashcards: 'Tarjetas de estudio',
    flashcardsSub: 'Aprende las señales',
    cdlTests: 'Exámenes de CDL',
    topics: 'Temas',
    topicA11y: (title: string, total: number, seen: number) =>
      `${title}. ${total === 1 ? '1 pregunta' : `${total} preguntas`}. ${seen === 1 ? '1 practicada' : `${seen} practicadas`}.`,
    topicProgress: (seen: number, total: number, accuracy: string) => `${seen}/${total} practicadas · ${accuracy} correctas`,
  },
);

export function PracticeScreen({navigation}: TabScreenProps<'Practice'>) {
  const {colors, spacing} = useTheme();
  const t = useStrings(STR);
  const learner = useLearner();
  const {bank, trackMeta, stateInfo, track, state} = learner;
  const now = useNow(navigation);
  const counts = useModeCounts(now);
  const progress = useTopicProgress(now);
  const marathons = useProgress(s => s.marathons);
  const dailyDone = useDailyChallengeDone(now);
  const bestSurvival = usePersonalBest('survival');
  const bestSpeed = usePersonalBest('speed');
  const marathon = marathonFor(marathons, track, state);
  const empty = bank.questions.length === 0;

  return (
    <Screen edges={['top']}>
      <LargeHeader
        title={t.title}
        subtitle={t.subtitle(stateInfo.name, trackMeta.title, bank.questions.length)}
        right={<IconButton icon="search" accessibilityLabel={t.search} onPress={() => navigation.navigate('Search')} background={colors.surface} />}
      />

      <TileGrid>
        <ModeTile title={t.practiceTest} subtitle={t.practiceTestSub} icon="target" color={hueAt(colors, 0)} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'practice'}})} disabled={empty} />
        <ModeTile title={t.exam} subtitle={t.examSub(learner.exam.questions)} icon="clipboard-check" color={hueAt(colors, 3)} onPress={() => navigation.navigate('ExamIntro', {})} disabled={empty} />
        <ModeTile
          title={t.marathon}
          subtitle={marathon ? t.resume(marathon.index, marathon.ids.length) : t.allQuestions(counts.total)}
          icon="infinity"
          color={hueAt(colors, 6)}
          onPress={() => navigation.navigate('Quiz', {spec: {mode: 'marathon'}})}
          disabled={empty}
        />
        <ModeTile
          title={t.stateLaws(stateInfo.name)}
          subtitle={counts.state ? t.stateOnly(counts.state) : t.comingSoon}
          icon="landmark"
          color={hueAt(colors, 7)}
          onPress={() => navigation.navigate('Quiz', {spec: {mode: 'state', title: t.stateLawsQuizTitle(stateInfo.name)}})}
          disabled={!counts.state}
          testID="tile-state-laws"
        />
        <ModeTile title={t.mistakes} subtitle={counts.mistakes ? t.toFix(counts.mistakes) : t.noneYet} icon="circle-x" color={hueAt(colors, 4)} badge={counts.mistakes} onPress={() => navigation.navigate('QuestionList', {kind: 'mistakes'})} />
        <ModeTile title={t.smartReview} subtitle={counts.due ? t.dueNow(counts.due) : t.nothingDue} icon="brain" color={hueAt(colors, 5)} badge={counts.due} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'due'}})} disabled={!counts.due} />
        <ModeTile title={t.saved} subtitle={counts.bookmarks ? t.savedCount(counts.bookmarks) : t.bookmarkQuestions} icon="bookmark" color={hueAt(colors, 2)} onPress={() => navigation.navigate('QuestionList', {kind: 'bookmarks'})} />
        <ModeTile title={t.hardest} subtitle={t.hardestSub} icon="flame" color={hueAt(colors, 4)} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'hardest'}})} disabled={!counts.hardest} />
        <ModeTile title={t.roadSigns} subtitle={t.questions(counts.signs)} icon="signpost" color={hueAt(colors, 2)} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'signs'}})} disabled={!counts.signs} />
        <ModeTile title={t.daily} subtitle={dailyDone ? t.dailyDone : t.dailySub} icon="calendar" color={hueAt(colors, 1)} done={dailyDone} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'daily'}})} disabled={empty} />
        <ModeTile title={t.survival} subtitle={bestSurvival ? t.best(bestSurvival) : t.survivalSub} icon="heart" color={hueAt(colors, 6)} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'survival'}})} disabled={empty} />
        <ModeTile title={t.speed} subtitle={bestSpeed ? t.best(bestSpeed) : t.speedSub} icon="zap" color={hueAt(colors, 2)} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'speed'}})} disabled={empty} />
        <ModeTile title={t.flashcards} subtitle={t.flashcardsSub} icon="layers" color={hueAt(colors, 0)} onPress={() => navigation.navigate('Flashcards', {})} />
      </TileGrid>

      <SectionHeader title={track === 'cdl' ? t.cdlTests : t.topics} />
      <View style={{gap: spacing.md}}>
        {trackMeta.topics.map(tp => (
          <TopicRow key={tp.id} topic={tp} progress={progress.get(tp.id)} onPress={() => navigation.navigate('Topic', {topic: tp.id})} />
        ))}
      </View>
    </Screen>
  );
}

function TopicRow({topic, progress, onPress}: {topic: TopicMeta; progress?: TopicProgress; onPress: () => void}) {
  const {colors, spacing} = useTheme();
  const t = useStrings(STR);
  const color = hueAt(colors, topic.hue);
  const total = progress?.total ?? 0;
  return (
    <Card onPress={onPress} accessibilityLabel={t.topicA11y(topic.title, total, progress?.seen ?? 0)} testID={`topic-${topic.id}`}>
      <View style={[styles.row, {gap: spacing.md}]}>
        <IconTile name={topic.icon} color={color} size={42} />
        <View style={styles.flex}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {topic.title}
          </Text>
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {total ? t.topicProgress(progress?.seen ?? 0, total, percent(progress?.accuracy)) : t.comingSoon}
          </Text>
        </View>
        {progress?.mistakes ? (
          <View style={[styles.row, {gap: 4}]}>
            <Icon name="circle-x" size={14} color={colors.danger} />
            <Text variant="captionStrong" color="danger">
              {progress.mistakes}
            </Text>
          </View>
        ) : null}
        <Icon name="chevron-right" color="textFaint" />
      </View>
      {total ? <MasteryBar seen={progress?.seen ?? 0} mastered={progress?.mastered ?? 0} total={total} color={color} style={{marginTop: spacing.md}} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
});
