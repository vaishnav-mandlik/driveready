import React, {useLayoutEffect, useMemo} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Button, Card, Chip, EmptyState, Icon, Screen, SignImage, Text} from '../../components';
import {topicTitle} from '../../data/tracks';
import type {Question} from '../../data/types';
import {isMistake} from '../../engine/srs';
import {useLearner} from '../../hooks/useLearner';
import {defineStrings, useStrings} from '../../i18n';
import {haptic} from '../../native';
import type {RootScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {useTheme} from '../../theme/ThemeProvider';
import {questionAccuracy} from './shared/practiceData';

const STR = defineStrings(
  {
    savedTitle: 'Saved Questions',
    mistakesTitle: 'Mistakes',
    practice: (n: number) => `Practice ${n === 1 ? 'this question' : `these ${n}`}`,
    savedIntro: 'Questions you saved. Tap one to review it.',
    mistakesIntro: 'Questions you missed. Answer each correctly twice in a row to clear it.',
    noSaved: 'No saved questions',
    noSavedMsg: 'Tap the bookmark on any question to save it for later review.',
    noMistakes: 'No mistakes to fix',
    noMistakesMsg: 'Questions you answer wrong will show up here until you master them.',
    startPracticing: 'Start practicing',
    remove: 'Remove from saved',
  },
  {
    savedTitle: 'Preguntas guardadas',
    mistakesTitle: 'Errores',
    practice: (n: number) => (n === 1 ? 'Practicar esta pregunta' : `Practicar estas ${n}`),
    savedIntro: 'Preguntas que guardaste. Toca una para repasarla.',
    mistakesIntro: 'Preguntas que fallaste. Responde cada una bien dos veces seguidas para quitarla.',
    noSaved: 'No hay preguntas guardadas',
    noSavedMsg: 'Toca el marcador en cualquier pregunta para guardarla y repasarla después.',
    noMistakes: 'No hay errores por corregir',
    noMistakesMsg: 'Las preguntas que respondas mal aparecerán aquí hasta que las domines.',
    startPracticing: 'Empezar a practicar',
    remove: 'Quitar de guardadas',
  },
);

export function QuestionListScreen({navigation, route}: RootScreenProps<'QuestionList'>) {
  const {spacing} = useTheme();
  const t = useStrings(STR);
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
    navigation.setOptions({title: kind === 'bookmarks' ? t.savedTitle : t.mistakesTitle});
  }, [navigation, kind, t]);

  const practice = () => navigation.navigate('Quiz', {spec: {mode: kind === 'bookmarks' ? 'bookmarks' : 'mistakes'}});

  return (
    <Screen
      scroll={false}
      padded={false}
      footer={questions.length ? <Button title={t.practice(questions.length)} icon="play" onPress={practice} fullWidth testID="list-practice" /> : undefined}>
      <FlatList
        data={questions}
        keyExtractor={q => q.id}
        contentContainerStyle={{padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl}}
        ListHeaderComponent={
          questions.length ? (
            <Text variant="caption" color="textMuted">
              {kind === 'bookmarks' ? t.savedIntro : t.mistakesIntro}
            </Text>
          ) : undefined
        }
        ListEmptyComponent={
          kind === 'bookmarks' ? (
            <EmptyState icon="bookmark" title={t.noSaved} message={t.noSavedMsg} />
          ) : (
            <EmptyState icon="circle-check" title={t.noMistakes} message={t.noMistakesMsg} actionLabel={t.startPracticing} onAction={() => navigation.navigate('Quiz', {spec: {mode: 'practice'}})} />
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
                  accessibilityLabel={t.remove}
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
