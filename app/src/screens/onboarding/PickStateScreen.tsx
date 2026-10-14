import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {Chip, Icon, Screen, Text} from '../../components';
import {hasResearchedData, STATE_LIST, stateList, StateListItem} from '../../data/states';
import type {StateCode} from '../../data/types';
import {defineStrings, useStrings} from '../../i18n';
import {haptic} from '../../native';
import type {RootScreenProps} from '../../navigation/types';
import {useSettings} from '../../store/settings';
import {useTheme} from '../../theme/ThemeProvider';

const STR = defineStrings(
  {
    verified: 'Verified',
    step: 'Step 1 of 3',
    title: 'Which state are you testing in?',
    intro: 'Rules, numbers and the test format differ by state. You can change this anytime.',
    search: 'Search states',
    empty: 'No matching state',
  },
  {
    verified: 'Verificado',
    step: 'Paso 1 de 3',
    title: '¿En qué estado vas a tomar el examen?',
    intro: 'Las reglas, las cifras y el formato del examen cambian según el estado. Puedes cambiarlo cuando quieras.',
    search: 'Buscar estados',
    empty: 'Ningún estado coincide',
  },
);

export function PickStateScreen({navigation, route}: RootScreenProps<'PickState'>) {
  const {colors, spacing, radius, textScale} = useTheme();
  const t = useStrings(STR);
  const mode = route.params?.mode ?? 'onboarding';
  const current = useSettings(s => s.state);
  const update = useSettings(s => s.update);
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const list = stateList();
    const q = query.trim().toLowerCase();
    // Match the displayed name, the English name (e.g. "New York" for "Nueva York") or the code.
    const english = new Map(STATE_LIST.map(st => [st.code, st.name.toLowerCase()]));
    return q ? list.filter(st => st.name.toLowerCase().includes(q) || english.get(st.code)!.includes(q) || st.code.toLowerCase() === q) : list;
  }, [query]);

  const choose = (code: StateCode) => {
    haptic('selection');
    update({state: code});
    if (mode === 'onboarding') {
      navigation.navigate('PickTrack', {mode: 'onboarding'});
    } else {
      navigation.goBack();
    }
  };

  const renderItem = ({item}: {item: StateListItem}) => {
    const selected = item.code === current;
    return (
      <Pressable
        onPress={() => choose(item.code)}
        accessibilityRole="button"
        accessibilityState={{selected}}
        accessibilityLabel={item.name}
        testID={`state-${item.code}`}
        style={({pressed}) => [
          styles.row,
          {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            gap: spacing.md,
            backgroundColor: selected ? colors.primarySoft : pressed ? colors.surfaceAlt : 'transparent',
            borderRadius: radius.md,
          },
        ]}>
        <View style={[styles.code, {backgroundColor: selected ? colors.primary : colors.surfaceAlt, borderRadius: radius.sm}]}>
          <Text variant="captionStrong" color={selected ? 'onPrimary' : 'textMuted'}>
            {item.code}
          </Text>
        </View>
        <Text variant="bodyStrong" style={styles.flex}>
          {item.name}
        </Text>
        {hasResearchedData(item.code) ? <Chip label={t.verified} icon="badge-check" tone="success" /> : null}
        {selected ? <Icon name="check" color={colors.primary} /> : null}
      </Pressable>
    );
  };

  return (
    <Screen edges={mode === 'onboarding' ? ['top'] : []} scroll={false} padded={false}>
      <View style={{paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md}}>
        {mode === 'onboarding' ? (
          <>
            <Text variant="label" color="primary">
              {t.step}
            </Text>
            <Text variant="title" accessibilityRole="header">
              {t.title}
            </Text>
            <Text variant="body" color="textMuted">
              {t.intro}
            </Text>
          </>
        ) : null}
        <View style={[styles.search, {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md}]}>
          <Icon name="search" size={18} color="textFaint" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t.search}
            placeholderTextColor={colors.textFaint}
            style={[styles.input, {color: colors.text, fontSize: 16 * textScale}]}
            autoCorrect={false}
            autoCapitalize="words"
            returnKeyType="search"
            accessibilityLabel={t.search}
            testID="state-search"
          />
        </View>
      </View>
      <FlatList
        data={data}
        keyExtractor={s => s.code}
        renderItem={renderItem}
        contentContainerStyle={{padding: spacing.sm, paddingBottom: spacing.huge}}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={20}
        ListEmptyComponent={
          <Text variant="body" color="textMuted" align="center" style={{marginTop: spacing.xl}}>
            {t.empty}
          </Text>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  code: {width: 40, height: 32, alignItems: 'center', justifyContent: 'center'},
  search: {flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, minHeight: 48},
  input: {flex: 1, paddingVertical: 10},
});
