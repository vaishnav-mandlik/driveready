import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Icon, IconButton, IconTile, LargeHeader, Screen, SectionHeader, Text} from '../../components';
import type {TopicMeta} from '../../data/tracks';
import {useLearner} from '../../hooks/useLearner';
import type {TabScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {percent} from './shared/format';
import {useDailyChallengeDone, useModeCounts, useNow, usePersonalBest, useTopicProgress} from './shared/hooks';
import {marathonFor, TopicProgress} from './shared/practiceData';
import {MasteryBar, ModeTile, TileGrid} from './shared/ui';

export function PracticeScreen({navigation}: TabScreenProps<'Practice'>) {
  const {colors, spacing} = useTheme();
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
        title="Practice"
        subtitle={`${stateInfo.name} · ${trackMeta.title} · ${bank.questions.length} questions`}
        right={<IconButton icon="search" accessibilityLabel="Search questions" onPress={() => navigation.navigate('Search')} background={colors.surface} />}
      />

      <TileGrid>
        <ModeTile title="Practice test" subtitle="20 adaptive questions" icon="target" color={hueAt(colors, 0)} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'practice'}})} disabled={empty} />
        <ModeTile title="Exam simulator" subtitle={`${learner.exam.questions} Q · real format`} icon="clipboard-check" color={hueAt(colors, 3)} onPress={() => navigation.navigate('ExamIntro', {})} disabled={empty} />
        <ModeTile
          title="Marathon"
          subtitle={marathon ? `Resume ${marathon.index}/${marathon.ids.length}` : `All ${counts.total} questions`}
          icon="infinity"
          color={hueAt(colors, 6)}
          onPress={() => navigation.navigate('Quiz', {spec: {mode: 'marathon'}})}
          disabled={empty}
        />
        <ModeTile title="Mistakes" subtitle={counts.mistakes ? `${counts.mistakes} to fix` : 'None yet'} icon="circle-x" color={hueAt(colors, 4)} badge={counts.mistakes} onPress={() => navigation.navigate('QuestionList', {kind: 'mistakes'})} />
        <ModeTile title="Smart review" subtitle={counts.due ? `${counts.due} due now` : 'Nothing due'} icon="brain" color={hueAt(colors, 5)} badge={counts.due} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'due'}})} disabled={!counts.due} />
        <ModeTile title="Saved" subtitle={counts.bookmarks ? `${counts.bookmarks} questions` : 'Bookmark questions'} icon="bookmark" color={hueAt(colors, 2)} onPress={() => navigation.navigate('QuestionList', {kind: 'bookmarks'})} />
        <ModeTile title="Hardest" subtitle="Your most-missed" icon="flame" color={hueAt(colors, 4)} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'hardest'}})} disabled={!counts.hardest} />
        <ModeTile title="Road signs" subtitle={`${counts.signs} questions`} icon="signpost" color={hueAt(colors, 2)} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'signs'}})} disabled={!counts.signs} />
        <ModeTile title="Daily challenge" subtitle={dailyDone ? 'Done for today' : '10 questions'} icon="calendar" color={hueAt(colors, 1)} done={dailyDone} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'daily'}})} disabled={empty} />
        <ModeTile title="Survival" subtitle={bestSurvival ? `Best: ${bestSurvival}` : '3 lives — how far?'} icon="heart" color={hueAt(colors, 6)} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'survival'}})} disabled={empty} />
        <ModeTile title="Speed round" subtitle={bestSpeed ? `Best: ${bestSpeed}` : '2 minutes'} icon="zap" color={hueAt(colors, 2)} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'speed'}})} disabled={empty} />
        <ModeTile title="Flashcards" subtitle="Learn the signs" icon="layers" color={hueAt(colors, 0)} onPress={() => navigation.navigate('Flashcards', {})} />
      </TileGrid>

      <SectionHeader title={track === 'cdl' ? 'CDL tests' : 'Topics'} />
      <View style={{gap: spacing.md}}>
        {trackMeta.topics.map(t => (
          <TopicRow key={t.id} topic={t} progress={progress.get(t.id)} onPress={() => navigation.navigate('Topic', {topic: t.id})} />
        ))}
      </View>
    </Screen>
  );
}

function TopicRow({topic, progress, onPress}: {topic: TopicMeta; progress?: TopicProgress; onPress: () => void}) {
  const {colors, spacing} = useTheme();
  const color = hueAt(colors, topic.hue);
  const total = progress?.total ?? 0;
  return (
    <Card onPress={onPress} accessibilityLabel={`${topic.title}. ${total} questions. ${progress?.seen ?? 0} practiced.`} testID={`topic-${topic.id}`}>
      <View style={[styles.row, {gap: spacing.md}]}>
        <IconTile name={topic.icon} color={color} size={42} />
        <View style={styles.flex}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {topic.title}
          </Text>
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {total ? `${progress?.seen ?? 0}/${total} practiced · ${percent(progress?.accuracy)} correct` : 'Coming soon'}
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
