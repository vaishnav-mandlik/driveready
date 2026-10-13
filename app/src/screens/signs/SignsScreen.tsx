import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {Card, Chip, EmptyState, Icon, IconTile, LargeHeader, Screen, SignImage, Text} from '../../components';
import {SIGN_CATEGORIES, allSigns, searchSigns} from '../../data/signs';
import type {SignCategory, SignInfo} from '../../data/types';
import {useLearner} from '../../hooks/useLearner';
import {haptic} from '../../native';
import type {TabScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {hueAt, useTheme} from '../../theme/ThemeProvider';

const SHAPES: {shape: string; meaning: string}[] = [
  {shape: 'Octagon (8 sides)', meaning: 'Stop — only used for STOP signs.'},
  {shape: 'Downward triangle', meaning: 'Yield — slow down and give the right-of-way.'},
  {shape: 'Diamond', meaning: 'Warning — a hazard or change ahead.'},
  {shape: 'Pentagon (5 sides)', meaning: 'School zone or school crossing.'},
  {shape: 'Circle', meaning: 'Railroad crossing ahead (advance warning).'},
  {shape: 'Crossbuck (X)', meaning: 'Railroad crossing — yield to trains.'},
  {shape: 'Pennant (sideways triangle)', meaning: 'No passing zone — on the left side of the road.'},
  {shape: 'Vertical rectangle', meaning: 'Regulatory — a law you must obey (e.g. speed limit).'},
  {shape: 'Horizontal rectangle', meaning: 'Guide — directions and information.'},
];
const COLORS: {color: string; meaning: string}[] = [
  {color: 'Red', meaning: 'Stop, yield, or prohibited'},
  {color: 'Yellow', meaning: 'General warning'},
  {color: 'Fluorescent yellow-green', meaning: 'School, pedestrian and bicycle warning'},
  {color: 'Orange', meaning: 'Work zone / construction'},
  {color: 'White', meaning: 'Regulatory (laws)'},
  {color: 'Green', meaning: 'Directions and guidance'},
  {color: 'Blue', meaning: 'Motorist services and accessibility'},
  {color: 'Brown', meaning: 'Recreation and cultural sites'},
  {color: 'Black', meaning: 'Regulatory (e.g. one way)'},
];

export function SignsScreen({navigation}: TabScreenProps<'Signs'>) {
  const {colors, spacing, radius, textScale} = useTheme();
  const {bank} = useLearner();
  const levels = useProgress(s => s.signLevels);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SignCategory | 'all'>('all');
  const [guideOpen, setGuideOpen] = useState(false);

  const present = useMemo(() => {
    const set = new Set(allSigns().map(s => s.category));
    return SIGN_CATEGORIES.filter(c => set.has(c.id));
  }, []);
  const data = useMemo(() => {
    const list = searchSigns(query);
    return category === 'all' ? list : list.filter(s => s.category === category);
  }, [query, category]);
  const known = useMemo(() => allSigns().filter(s => (levels[s.code] ?? 0) >= 2).length, [levels]);

  const header = (
    <View style={{gap: spacing.md, marginBottom: spacing.md}}>
      <LargeHeader title="Road Signs" subtitle={`${allSigns().length} signs, signals & markings · ${known} known`} />
      <View style={[styles.row, {gap: spacing.md}]}>
        <Card style={styles.flex} onPress={() => navigation.navigate('Quiz', {spec: {mode: 'signs'}})} accessibilityLabel="Road signs quiz">
          <IconTile name="target" color={hueAt(colors, 2)} />
          <Text variant="bodyStrong" style={{marginTop: spacing.sm}}>
            Signs quiz
          </Text>
          <Text variant="caption" color="textMuted">
            {bank.signQuestions.length ? `${bank.signQuestions.length} questions` : 'Coming soon'}
          </Text>
        </Card>
        <Card style={styles.flex} onPress={() => navigation.navigate('Flashcards', {category: category})} accessibilityLabel="Sign flashcards">
          <IconTile name="layers" color={hueAt(colors, 3)} />
          <Text variant="bodyStrong" style={{marginTop: spacing.sm}}>
            Flashcards
          </Text>
          <Text variant="caption" color="textMuted">
            {known}/{allSigns().length} known
          </Text>
        </Card>
      </View>
      <Card onPress={() => setGuideOpen(o => !o)} accessibilityLabel={`Shapes and colors guide, ${guideOpen ? 'expanded' : 'collapsed'}`}>
        <View style={[styles.row, {gap: spacing.md}]}>
          <IconTile name="shapes" color={hueAt(colors, 0)} size={36} />
          <Text variant="bodyStrong" style={styles.flex}>
            Shapes & colors cheat sheet
          </Text>
          <Icon name={guideOpen ? 'chevron-up' : 'chevron-down'} color="textFaint" />
        </View>
        {guideOpen ? (
          <View style={{marginTop: spacing.md, gap: spacing.xs}}>
            <Text variant="label" color="textMuted">
              Shapes
            </Text>
            {SHAPES.map(s => (
              <Text key={s.shape} variant="body">
                <Text variant="bodyStrong">{s.shape}: </Text>
                {s.meaning}
              </Text>
            ))}
            <Text variant="label" color="textMuted" style={{marginTop: spacing.md}}>
              Colors
            </Text>
            {COLORS.map(c => (
              <Text key={c.color} variant="body">
                <Text variant="bodyStrong">{c.color}: </Text>
                {c.meaning}
              </Text>
            ))}
          </View>
        ) : null}
      </Card>
      <View style={[styles.search, {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md}]}>
        <Icon name="search" size={18} color="textFaint" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search signs"
          placeholderTextColor={colors.textFaint}
          autoCorrect={false}
          accessibilityLabel="Search signs"
          style={[styles.input, {color: colors.text, fontSize: 16 * textScale}]}
        />
      </View>
      <View style={[styles.wrap, {gap: spacing.sm}]}>
        <Chip label="All" selected={category === 'all'} onPress={() => setCategory('all')} />
        {present.map(c => (
          <Chip key={c.id} label={c.title} selected={category === c.id} onPress={() => setCategory(c.id)} />
        ))}
      </View>
    </View>
  );

  return (
    <Screen edges={['top']} scroll={false} padded={false}>
      <FlatList
        data={data}
        keyExtractor={s => s.code}
        numColumns={3}
        ListHeaderComponent={header}
        contentContainerStyle={{padding: spacing.lg, paddingBottom: spacing.huge}}
        columnWrapperStyle={{gap: spacing.sm}}
        initialNumToRender={18}
        windowSize={9}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<EmptyState icon="signpost" title="No signs found" message="Try another word or category." />}
        renderItem={({item}) => <SignTile sign={item} level={levels[item.code] ?? -1} onPress={() => navigation.navigate('SignDetail', {code: item.code})} />}
      />
    </Screen>
  );
}

const SignTile = React.memo(function SignTile({sign, level, onPress}: {sign: SignInfo; level: number; onPress: () => void}) {
  const {colors, spacing, radius, dark} = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptic('selection');
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${sign.name}${level >= 2 ? ', known' : ''}`}
      style={({pressed}) => [
        styles.tile,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          padding: spacing.sm,
          marginBottom: spacing.sm,
          borderWidth: dark ? 1 : 0,
          borderColor: colors.border,
        },
        pressed && styles.pressed,
      ]}>
      <View style={styles.tileArt}>
        <SignImage code={sign.code} size={72} accessibilityLabel="" />
      </View>
      <Text variant="caption" align="center" numberOfLines={2} style={{marginTop: spacing.xs}}>
        {sign.name}
      </Text>
      {level >= 0 ? (
        <View style={[styles.dot, {backgroundColor: level >= 2 ? colors.success : level === 1 ? colors.warning : colors.danger}]} />
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  wrap: {flexDirection: 'row', flexWrap: 'wrap'},
  search: {flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, minHeight: 48},
  input: {flex: 1, paddingVertical: 10},
  tile: {flex: 1 / 3, alignItems: 'center', minHeight: 128},
  tileArt: {height: 80, alignItems: 'center', justifyContent: 'center'},
  pressed: {opacity: 0.7},
  dot: {position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4},
});
