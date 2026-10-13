import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Card, Chip, EmptyState, Screen, Text} from '../../components';
import {QuestionTools, ReportLink} from '../../components/quiz/QuestionActions';
import {QuestionCard} from '../../components/quiz/QuestionCard';
import {topicTitle} from '../../data/tracks';
import {useLearner} from '../../hooks/useLearner';
import type {RootScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {useTheme} from '../../theme/ThemeProvider';
import {questionAccuracy, questionStatus} from '../practice/shared/practiceData';
import {StatusChip} from '../practice/shared/ui';

export function QuestionDetailScreen({navigation, route}: RootScreenProps<'QuestionDetail'>) {
  const {spacing} = useTheme();
  const {bank} = useLearner();
  const question = bank.byId.get(route.params.id);
  const stat = useProgress(s => s.stats[route.params.id]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  if (!question) {
    return (
      <Screen>
        <EmptyState icon="search" title="Question not found" message="This question isn't part of your current state and test." actionLabel="Go back" onAction={() => navigation.goBack()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <QuestionCard
        question={question}
        chosen={chosen}
        revealed={revealed}
        onChoose={i => {
          setChosen(i);
          setRevealed(true);
        }}
        locked={revealed}
        eyebrow={
          <>
            <Chip label={topicTitle(question.topic)} />
            {question.states ? <Chip label="State law" icon="landmark" tone="accent" /> : null}
          </>
        }
        tools={<QuestionTools question={question} revealed={revealed} />}
        footer={revealed ? <ReportLink question={question} /> : null}
      />
      {!revealed ? (
        <Button title="Show answer" variant="secondary" icon="eye" onPress={() => setRevealed(true)} style={{marginTop: spacing.md}} fullWidth />
      ) : (
        <Button
          title="Try again"
          variant="outline"
          icon="reset"
          onPress={() => {
            setChosen(null);
            setRevealed(false);
          }}
          style={{marginTop: spacing.md}}
          fullWidth
        />
      )}
      <Card style={[styles.row, {gap: spacing.md, marginTop: spacing.md}]}>
        <StatusChip status={questionStatus(stat)} />
        <Text variant="caption" color="textMuted" style={styles.flex}>
          {questionAccuracy(stat)}
        </Text>
      </Card>
      <View style={{height: spacing.md}} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
});
