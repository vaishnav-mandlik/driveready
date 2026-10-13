import React, {useLayoutEffect, useMemo} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Button, Card, Chip, EmptyState, Icon, Screen, SignImage, Text} from '../../components';
import {topicTitle} from '../../data/tracks';
import type {Question} from '../../data/types';
import {isMistake} from '../../engine/srs';
import {useLearner} from '../../hooks/useLearner';
import {haptic} from '../../native';
import type {RootScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {useTheme} from '../../theme/ThemeProvider';
import {questionAccuracy} from './shared/practiceData';

export function QuestionListScreen({navigation, route}: RootScreenProps<'QuestionList'>) {
  const {spacing} = useTheme();
  const {kind} = route.params;
  const {bank} = useLearner();
  const stats = useProgress(s => s.stats);
  const bookmarks = useProgress(s => s.bookmarks);
  const toggleBookmark = useProgress(s => s.toggleBookmark);

  const questions = useMemo<Question[]>(() => {
    if (kind === 'bookmarks') {
      return bank.questions.filter(q => bookmarks[q.id]).sort((a, b) => bookmarks[b.id] - bookmarks[a.id]);
    }
    return bank.questions.filter(q => isMistake(stats[q.id])).sort((a, b) => (stats[b.id]?.t ?? 0) - (stats[a.id]?.t ?? 0));
  }, [kind, bank, stats, bookmarks]);

  useLayoutEffect(() => {
    navigation.setOptions({title: kind === 'bookmarks' ? 'Saved Questions' : 'Mistakes'});
  }, [navigation, kind]);

  const practice = () => navigation.navigate('Quiz', {spec: {mode: kind === 'bookmarks' ? 'bookmarks' : 'mistakes'}});

  return (
    <Screen
      scroll={false}
      padded={false}
      footer={questions.length ? <Button title={`Practice ${questions.length === 1 ? 'this question' : `these ${questions.length}`}`} icon="play" onPress={practice} fullWidth testID="list-practice" /> : undefined}>
      <FlatList
        data={questions}
        keyExtractor={q => q.id}
        contentContainerStyle={{padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl}}
        ListHeaderComponent={
          questions.length ? (
            <Text variant="caption" color="textMuted">
              {kind === 'bookmarks'
                ? 'Questions you saved. Tap one to review it.'
                : 'Questions you missed. Answer each correctly twice in a row to clear it.'}
            </Text>
          ) : undefined
        }
        ListEmptyComponent={
          kind === 'bookmarks' ? (
            <EmptyState icon="bookmark" title="No saved questions" message="Tap the bookmark on any question to save it for later review." />
          ) : (
            <EmptyState icon="circle-check" title="No mistakes to fix" message="Questions you answer wrong will show up here until you master them." actionLabel="Start practicing" onAction={() => navigation.navigate('Quiz', {spec: {mode: 'practice'}})} />
          )
        }
        renderItem={({item}) => (
          <Card onPress={() => navigation.navigate('QuestionDetail', {id: item.id})} accessibilityLabel={item.prompt}>
            <View style={[styles.row, {gap: spacing.md}]}>
              {item.sign ? <SignImage code={item.sign} size={48} /> : null}
              <View style={styles.flex}>
                <Text variant="bodyStrong" numberOfLines={3}>
                  {item.prompt}
                </Text>
                <View style={[styles.row, {gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap'}]}>
                  <Chip label={topicTitle(item.topic)} />
                  <Text variant="caption" color="textMuted">
                    {questionAccuracy(stats[item.id])}
                  </Text>
                </View>
              </View>
              {kind === 'bookmarks' ? (
                <Pressable
                  onPress={() => {
                    haptic('selection');
                    toggleBookmark(item.id);
                  }}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Remove from saved"
                  style={styles.remove}>
                  <Icon name="trash" size={18} color="textFaint" />
                </Pressable>
              ) : null}
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  remove: {padding: 4},
});
