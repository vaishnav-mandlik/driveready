import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Icon, IconTile, Screen, Text} from '../../components';
import {getTrack, TRACKS} from '../../data/tracks';
import type {TrackId} from '../../data/types';
import {defineStrings, useStrings} from '../../i18n';
import type {RootScreenProps} from '../../navigation/types';
import {useSettings} from '../../store/settings';
import {hueAt, useTheme} from '../../theme/ThemeProvider';

const STR = defineStrings(
  {
    step: 'Step 2 of 3',
    title: 'What are you studying for?',
    intro: 'You can switch test types later — your progress for each is kept.',
  },
  {
    step: 'Paso 2 de 3',
    title: '¿Para qué estás estudiando?',
    intro: 'Puedes cambiar de tipo de examen después; se guarda tu progreso en cada uno.',
  },
);

export function PickTrackScreen({navigation, route}: RootScreenProps<'PickTrack'>) {
  const {colors, spacing} = useTheme();
  const str = useStrings(STR);
  const mode = route.params?.mode ?? 'onboarding';
  const current = useSettings(s => s.track);
  const update = useSettings(s => s.update);

  const choose = (track: TrackId) => {
    update({track});
    if (mode === 'onboarding') {
      navigation.navigate('Goal', {mode: 'onboarding'});
    } else {
      navigation.goBack();
    }
  };

  return (
    <Screen edges={mode === 'onboarding' ? ['top'] : []}>
      {mode === 'onboarding' ? (
        <View style={{gap: spacing.md, marginBottom: spacing.xl}}>
          <Text variant="label" color="primary">
            {str.step}
          </Text>
          <Text variant="title" accessibilityRole="header">
            {str.title}
          </Text>
          <Text variant="body" color="textMuted">
            {str.intro}
          </Text>
        </View>
      ) : null}
      <View style={{gap: spacing.md}}>
        {/* getTrack returns the track in the current language (TRACKS stays the English data). */}
        {TRACKS.map(({id}) => getTrack(id)).map((t, i) => {
          const selected = t.id === current;
          const color = hueAt(colors, i === 0 ? 0 : i === 1 ? 3 : 2);
          return (
            <Card
              key={t.id}
              onPress={() => choose(t.id)}
              accessibilityLabel={`${t.title}. ${t.license}. ${t.description}`}
              testID={`track-${t.id}`}
              style={selected ? {borderWidth: 2, borderColor: colors.primary} : undefined}>
              <View style={[styles.row, {gap: spacing.md}]}>
                <IconTile name={t.icon} color={color} size={52} />
                <View style={styles.flex}>
                  <Text variant="heading">{t.title}</Text>
                  <Text variant="captionStrong" color="textMuted">
                    {t.license}
                  </Text>
                </View>
                {selected ? <Icon name="circle-check" color={colors.primary} /> : <Icon name="chevron-right" color="textFaint" />}
              </View>
              <Text variant="body" color="textMuted" style={{marginTop: spacing.md}}>
                {t.description}
              </Text>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
});
