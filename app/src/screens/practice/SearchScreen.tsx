import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, TextInput, View} from 'react-native';
import {Card, Chip, EmptyState, Icon, Screen, Text} from '../../components';
import {searchBank} from '../../data/bank';
import {topicTitle} from '../../data/tracks';
import {useLearner} from '../../hooks/useLearner';
import {defineStrings, useStrings} from '../../i18n';
import type {RootScreenProps} from '../../navigation/types';
import {useTheme} from '../../theme/ThemeProvider';
import {HighlightText, searchTerms} from './shared/ui';

const STR = defineStrings(
  {
    placeholder: 'Search questions (e.g. hydrant, school bus)',
    search: 'Search questions',
    results: (n: number, more: boolean) => `${n}${more ? '+' : ''} result${n === 1 ? '' : 's'}`,
    noMatches: 'No matches',
    noMatchesMsg: "Try a different word, like 'merge', 'flashing' or 'parking'.",
    searchAll: 'Search every question',
    searchAllMsg: (n: number) => `${n} questions for your state and test. Search by keyword to find any rule fast.`,
  },
  {
    placeholder: 'Buscar preguntas (p. ej., hidrante, autobús escolar)',
    search: 'Buscar preguntas',
    results: (n: number, more: boolean) => `${n}${more ? '+' : ''} resultado${n === 1 ? '' : 's'}`,
    noMatches: 'Sin resultados',
    noMatchesMsg: 'Prueba con otra palabra, como “incorporarse”, “intermitente” o “estacionar”.',
    searchAll: 'Busca en todas las preguntas',
    searchAllMsg: (n: number) =>
      `${n === 1 ? '1 pregunta' : `${n} preguntas`} para tu estado y examen. Busca por palabra clave para encontrar cualquier regla rápido.`,
  },
);

export function SearchScreen({navigation}: RootScreenProps<'Search'>) {
  const {colors, spacing, radius, textScale} = useTheme();
  const t = useStrings(STR);
  const {bank} = useLearner();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(id);
  }, [query]);

  const results = useMemo(() => searchBank(bank, debounced), [bank, debounced]);
  const terms = useMemo(() => searchTerms(debounced), [debounced]);

  return (
    <Screen scroll={false} padded={false}>
      <View style={{padding: spacing.lg, paddingBottom: spacing.sm}}>
        <View style={[styles.search, {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md}]}>
          <Icon name="search" size={18} color="textFaint" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t.placeholder}
            placeholderTextColor={colors.textFaint}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel={t.search}
            style={[styles.input, {color: colors.text, fontSize: 16 * textScale}]}
            testID="search-input"
          />
        </View>
      </View>
      <FlatList
        data={results}
        keyExtractor={q => q.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.md, paddingBottom: spacing.huge}}
        ListHeaderComponent={
          debounced.trim() && results.length ? (
            <Text variant="caption" color="textMuted">
              {t.results(results.length, results.length === 60)}
            </Text>
          ) : undefined
        }
        ListEmptyComponent={
          debounced.trim() ? (
            <EmptyState icon="search" title={t.noMatches} message={t.noMatchesMsg} />
          ) : (
            <EmptyState icon="search" title={t.searchAll} message={t.searchAllMsg(bank.questions.length)} />
          )
        }
        renderItem={({item}) => (
          <Card onPress={() => navigation.navigate('QuestionDetail', {id: item.id})} accessibilityLabel={item.prompt}>
            <HighlightText text={item.prompt} terms={terms} variant="bodyStrong" numberOfLines={3} />
            <View style={{marginTop: spacing.sm}}>
              <Chip label={topicTitle(item.topic)} />
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, minHeight: 48},
  input: {flex: 1, paddingVertical: 10},
});
