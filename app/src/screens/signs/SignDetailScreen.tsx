import React, {useLayoutEffect, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Card, Chip, Divider, EmptyState, Icon, ListRow, Screen, SectionHeader, SignImage, Text} from '../../components';
import {signCategories, allSigns, getSign} from '../../data/signs';
import {useLearner} from '../../hooks/useLearner';
import {speech} from '../../native';
import type {RootScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {useTheme} from '../../theme/ThemeProvider';

export function SignDetailScreen({navigation, route}: RootScreenProps<'SignDetail'>) {
  const {colors, spacing, radius} = useTheme();
  const {code} = route.params;
  const sign = getSign(code);
  const {bank} = useLearner();
  const level = useProgress(s => s.signLevels[code] ?? -1);
  const setLevel = useProgress(s => s.setSignLevel);
  const list = allSigns();
  const idx = list.findIndex(s => s.code === code);
  const related = useMemo(() => bank.questions.filter(q => q.sign === code), [bank, code]);
  const category = signCategories().find(c => c.id === sign?.category);

  useLayoutEffect(() => {
    navigation.setOptions({title: sign?.name ?? ''});
  }, [navigation, sign]);

  if (!sign) {
    return (
      <Screen>
        <EmptyState icon="signpost" title="Sign not found" message="This sign isn't in the library." actionLabel="Go back" onAction={() => navigation.goBack()} />
      </Screen>
    );
  }

  const go = (i: number) => navigation.setParams({code: list[(i + list.length) % list.length].code});

  return (
    <Screen
      footer={
        <View style={[styles.row, {gap: spacing.md}]}>
          <Button title="Previous" variant="outline" icon="chevron-left" onPress={() => go(idx - 1)} style={styles.flex} />
          <Button title="Next" variant="outline" iconRight="chevron-right" onPress={() => go(idx + 1)} style={styles.flex} />
        </View>
      }>
      <View style={[styles.art, {backgroundColor: colors.surfaceAlt, borderRadius: radius.xl, padding: spacing.xl}]}>
        <SignImage code={sign.code} size={200} />
      </View>
      <View style={[styles.row, {gap: spacing.sm, marginTop: spacing.lg, flexWrap: 'wrap'}]}>
        {category ? <Chip label={category.title} icon={category.icon} tone="primary" /> : null}
        {sign.shape ? <Chip label={sign.shapeLabel ?? sign.shape} /> : null}
        {/^(R|W|S|M|D|E|G|EM)\d/.test(sign.code) ? <Chip label={`MUTCD ${sign.code}`} /> : null}
      </View>
      <Text variant="title" style={{marginTop: spacing.md}} accessibilityRole="header">
        {sign.name}
      </Text>
      <Card variant="tinted" tint={colors.primarySoft} style={{marginTop: spacing.md}}>
        <View style={[styles.row, {gap: spacing.sm, marginBottom: spacing.xs}]}>
          <Icon name="lightbulb" size={18} color={colors.primary} />
          <Text variant="label" color="primary">
            What it means
          </Text>
        </View>
        <Text variant="bodyStrong">{sign.meaning}</Text>
      </Card>
      {sign.colors ? (
        <Text variant="caption" color="textMuted" style={{marginTop: spacing.md}}>
          Colors: {sign.colorsLabel ?? sign.colors}
        </Text>
      ) : null}

      <View style={[styles.row, {gap: spacing.md, marginTop: spacing.lg}]}>
        <Button title="Still learning" variant={level === 0 ? 'danger' : 'outline'} size="sm" onPress={() => setLevel(sign.code, 0)} style={styles.flex} />
        <Button title="I know it" variant={level >= 2 ? 'success' : 'outline'} size="sm" icon="check" onPress={() => setLevel(sign.code, 2)} style={styles.flex} />
        <Button title="Hear" variant="ghost" size="sm" icon="volume" onPress={() => speech.speak(`${sign.name}. ${sign.meaning}`)} />
      </View>

      {related.length ? (
        <>
          <SectionHeader title={`Questions about this sign (${related.length})`} />
          <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
            {related.map((q, i) => (
              <React.Fragment key={q.id}>
                {i ? <Divider /> : null}
                <ListRow title={q.prompt} onPress={() => navigation.navigate('QuestionDetail', {id: q.id})} />
              </React.Fragment>
            ))}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  art: {alignItems: 'center', justifyContent: 'center', minHeight: 240},
});
