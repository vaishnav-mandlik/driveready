import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, TextInput, View} from 'react-native';
import {Card, Chip, EmptyState, Icon, Screen, Text} from '../../components';
import {searchBank} from '../../data/bank';
import {topicTitle} from '../../data/tracks';
import {useLearner} from '../../hooks/useLearner';
import type {RootScreenProps} from '../../navigation/types';
import {useTheme} from '../../theme/ThemeProvider';
import {HighlightText, searchTerms} from './shared/ui';

export function SearchScreen({navigation}: RootScreenProps<'Search'>) {
  const {colors, spacing, radius, textScale} = useTheme();
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
            placeholder="Search questions (e.g. hydrant, school bus)"
            placeholderTextColor={colors.textFaint}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search questions"
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
              {results.length}
              {results.length === 60 ? '+' : ''} result{results.length === 1 ? '' : 's'}
            </Text>
          ) : undefined
        }
        ListEmptyComponent={
          debounced.trim() ? (
            <EmptyState icon="search" title="No matches" message="Try a different word, like 'merge', 'flashing' or 'parking'." />
          ) : (
            <EmptyState icon="search" title="Search every question" message={`${bank.questions.length} questions for your state and test. Search by keyword to find any rule fast.`} />
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
