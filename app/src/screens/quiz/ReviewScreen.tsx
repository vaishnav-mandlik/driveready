import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Chip, EmptyState, Screen, Text} from '../../components';
import {QuestionTools, ReportLink} from '../../components/quiz/QuestionActions';
import {QuestionCard} from '../../components/quiz/QuestionCard';
import {getBank} from '../../data/bank';
import {topicTitle} from '../../data/tracks';
import type {Question} from '../../data/types';
import {defineStrings, useStrings} from '../../i18n';
import type {RootScreenProps} from '../../navigation/types';
import {getSession} from '../../store/session';
import {useTheme} from '../../theme/ThemeProvider';

type Filter = 'all' | 'wrong' | 'correct' | 'skipped';

const STR = defineStrings(
  {
    nothingToReview: 'Nothing to review',
    unavailable: 'This session is no longer available.',
    goBack: 'Go back',
    all: (n: number) => `All ${n}`,
    wrongN: (n: number) => `Wrong ${n}`,
    correctN: (n: number) => `Correct ${n}`,
    skippedN: (n: number) => `Skipped ${n}`,
    nothingHere: 'Nothing here',
    noWrong: 'No wrong answers — great job!',
    noMatch: 'No questions match this filter.',
    qNumber: (n: number) => `Q${n}`,
    correct: 'Correct',
    wrong: 'Wrong',
    skipped: 'Skipped',
  },
  {
    nothingToReview: 'Nada que revisar',
    unavailable: 'Esta sesión ya no está disponible.',
    goBack: 'Regresar',
    all: (n: number) => `Todas ${n}`,
    wrongN: (n: number) => `Incorrectas ${n}`,
    correctN: (n: number) => `Correctas ${n}`,
    skippedN: (n: number) => `Omitidas ${n}`,
    nothingHere: 'No hay nada aquí',
    noWrong: 'Ninguna respuesta incorrecta. ¡Buen trabajo!',
    noMatch: 'Ninguna pregunta coincide con este filtro.',
    qNumber: (n: number) => `P${n}`,
    correct: 'Correcta',
    wrong: 'Incorrecta',
    skipped: 'Omitida',
  },
);

interface Row {
  index: number;
  question: Question;
  chosen: number | null;
  order: number[];
  verdict: 'correct' | 'wrong' | 'skipped';
}

export function ReviewScreen({navigation, route}: RootScreenProps<'Review'>) {
  const {spacing} = useTheme();
  const t = useStrings(STR);
  const session = getSession(route.params.sessionId);
  const [filter, setFilter] = useState<Filter>(route.params.filter ?? 'all');

  const rows = useMemo<Row[]>(() => {
    if (!session) {
      return [];
    }
    const bank = getBank(session.track, session.state);
    const out: Row[] = [];
    session.questionIds.forEach((id, index) => {
      const question = bank.byId.get(id);
      if (!question) {
        return;
      }
      const chosen = session.answers[index] ?? null;
      out.push({
        index,
        question,
        chosen,
        order: session.orders[index],
        verdict: chosen === null ? 'skipped' : chosen === question.answer ? 'correct' : 'wrong',
      });
    });
    return out;
  }, [session]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      wrong: rows.filter(r => r.verdict === 'wrong').length,
      correct: rows.filter(r => r.verdict === 'correct').length,
      skipped: rows.filter(r => r.verdict === 'skipped').length,
    }),
    [rows],
  );
  const visible = filter === 'all' ? rows : rows.filter(r => r.verdict === filter);

  if (!session) {
    return (
      <Screen>
        <EmptyState icon="clipboard" title={t.nothingToReview} message={t.unavailable} actionLabel={t.goBack} onAction={() => navigation.goBack()} />
      </Screen>
    );
  }

  const filters: {key: Filter; label: string}[] = [
    {key: 'all', label: t.all(counts.all)},
    {key: 'wrong', label: t.wrongN(counts.wrong)},
    {key: 'correct', label: t.correctN(counts.correct)},
    ...(counts.skipped ? [{key: 'skipped' as Filter, label: t.skippedN(counts.skipped)}] : []),
  ];

  return (
    <Screen scroll={false} padded={false}>
      <FlatList
        data={visible}
        keyExtractor={r => String(r.index)}
        contentContainerStyle={{padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.huge}}
        initialNumToRender={4}
        windowSize={7}
        ListHeaderComponent={
          <View style={[styles.filters, {gap: spacing.sm, marginBottom: spacing.sm}]}>
            {filters.map(f => (
              <Chip key={f.key} label={f.label} selected={filter === f.key} onPress={() => setFilter(f.key)} />
            ))}
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="circle-check" title={t.nothingHere} message={filter === 'wrong' ? t.noWrong : t.noMatch} />
        }
        renderItem={({item}) => (
          <QuestionCard
            question={item.question}
            order={item.order}
            chosen={item.chosen}
            revealed
            compact
            explanationSeed={item.index}
            eyebrow={
              <>
                <Text variant="captionStrong" color="textMuted">
                  {t.qNumber(item.index + 1)}
                </Text>
                <Chip
                  label={item.verdict === 'correct' ? t.correct : item.verdict === 'wrong' ? t.wrong : t.skipped}
                  icon={item.verdict === 'correct' ? 'circle-check' : item.verdict === 'wrong' ? 'circle-x' : 'minus'}
                  tone={item.verdict === 'correct' ? 'success' : item.verdict === 'wrong' ? 'danger' : 'neutral'}
                />
                <Chip label={topicTitle(item.question.topic)} />
              </>
            }
            tools={<QuestionTools question={item.question} order={item.order} revealed />}
            footer={<ReportLink question={item.question} />}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {flexDirection: 'row', flexWrap: 'wrap'},
});
