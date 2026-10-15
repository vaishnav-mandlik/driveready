import React, {useMemo} from 'react';
import {Alert, AlertButton, Share, StyleSheet, View} from 'react-native';
import {Button, Card, EmptyState, Icon, IconTile, Screen, SectionHeader, Text} from '../../components';
import {groupFacts} from '../../data/factMeta';
import type {StateFact} from '../../data/types';
import {useLearner} from '../../hooks/useLearner';
import {defineStrings, tr, useStrings} from '../../i18n';
import {speech} from '../../native';
import type {RootScreenProps} from '../../navigation/types';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {openOfficial} from '../quiz/ExamIntroScreen';
import {sourceLabel} from './sourceLabel';

const STR = defineStrings(
  {
    close: 'Close',
    openSource: 'Open source',
    officialSourceLink: 'the official source',
    sourceTitle: (label: string, source: string) => `${label} — ${source}`,
    verifiedSource: 'Verified against the official source.',
    soonTitle: 'Cheat sheet coming soon',
    soonMessage: (state: string) => `We're verifying ${state}'s rules against the official handbook. Until then, use the official handbook for exact numbers.`,
    openHandbook: 'Open official handbook',
    goBack: 'Go back',
    handbookLink: 'the official handbook',
    verified: 'Verified against the official handbook',
    checked: (date: string) => ` · checked ${date}`,
    tapRule: '. Tap any rule to see the exact wording and page.',
    sourceHint: 'Shows the official source',
    onlyIn: (state: string) => `Only in ${state}`,
    flashcards: 'Memorize with flashcards',
    share: 'Share cheat sheet',
    shareTitle: (state: string) => `${state} driver cheat sheet`,
    shareHeader: (state: string) => `${state} driver cheat sheet — from DriveReady (free DMV practice tests)`,
    shareSource: (source: string) => `Source: ${source}. Always confirm with your state's official handbook.`,
    readAloud: 'Read the cheat sheet aloud',
    lawsChange: "Laws change. Always confirm with your state's official handbook before your test.",
  },
  {
    close: 'Cerrar',
    openSource: 'Abrir fuente',
    officialSourceLink: 'la fuente oficial',
    sourceTitle: (label: string, source: string) => `${label} — ${source}`,
    verifiedSource: 'Verificado con la fuente oficial.',
    soonTitle: 'Hoja de repaso próximamente',
    soonMessage: (state: string) => `Estamos verificando las reglas de ${state} con el manual oficial. Mientras tanto, consulta el manual oficial para los números exactos.`,
    openHandbook: 'Abrir manual oficial',
    goBack: 'Regresar',
    handbookLink: 'el manual oficial',
    verified: 'Verificada con el manual oficial',
    checked: (date: string) => ` · revisada el ${date}`,
    tapRule: '. Toca cualquier regla para ver el texto exacto y la página.',
    sourceHint: 'Muestra la fuente oficial',
    onlyIn: (state: string) => `Solo en ${state}`,
    flashcards: 'Memoriza con tarjetas de estudio',
    share: 'Compartir hoja de repaso',
    shareTitle: (state: string) => `Hoja de repaso para conductores de ${state}`,
    shareHeader: (state: string) => `Hoja de repaso para conductores de ${state} — de DriveReady (exámenes de práctica del DMV gratis)`,
    shareSource: (source: string) => `Fuente: ${source}. Confirma siempre con el manual oficial de tu estado.`,
    readAloud: 'Leer la hoja de repaso en voz alta',
    lawsChange: 'Las leyes cambian. Confirma siempre con el manual oficial de tu estado antes de tu examen.',
  },
);

function showSource(fact: StateFact & {label: string}, handbookUrl: string) {
  const t = tr(STR);
  const buttons: AlertButton[] = [{text: t.close, style: 'cancel'}];
  if (fact.source.url) {
    buttons.push({text: t.openSource, onPress: () => openOfficial(fact.source.url, t.officialSourceLink)});
  }
  Alert.alert(
    t.sourceTitle(fact.label, sourceLabel(fact.source, handbookUrl)),
    fact.source.quote ? `“${fact.source.quote.trim()}”` : t.verifiedSource,
    buttons,
  );
}

export function CheatSheetScreen({navigation}: RootScreenProps<'CheatSheet'>) {
  const {colors, spacing, radius} = useTheme();
  const t = useStrings(STR);
  const {stateInfo} = useLearner();
  const groups = useMemo(() => groupFacts(stateInfo.facts), [stateInfo]);

  if (!stateInfo.facts.length) {
    return (
      <Screen>
        <EmptyState
          icon="file"
          title={t.soonTitle}
          message={t.soonMessage(stateInfo.name)}
          actionLabel={stateInfo.handbook.url ? t.openHandbook : t.goBack}
          onAction={() => (stateInfo.handbook.url ? openOfficial(stateInfo.handbook.url, t.handbookLink) : navigation.goBack())}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Card variant="tinted" tint={colors.successSoft}>
        <View style={[styles.row, {gap: spacing.sm}]}>
          <Icon name="badge-check" color={colors.success} />
          <Text variant="bodyStrong" style={styles.flex}>
            {t.verified}
          </Text>
        </View>
        <Text variant="caption" color="textMuted" style={{marginTop: spacing.xs}}>
          {stateInfo.handbook.title}
          {stateInfo.handbook.edition ? ` (${stateInfo.handbook.edition})` : ''}
          {stateInfo.verifiedOn ? t.checked(stateInfo.verifiedOn) : ''}
          {t.tapRule}
        </Text>
      </Card>

      {groups.map(({group, facts}) => (
        <View key={group.id}>
          <SectionHeader title={group.title} />
          <View style={{gap: spacing.sm}}>
            {facts.map(f => (
              <Card key={f.key} onPress={() => showSource(f, stateInfo.handbook.url)} accessibilityLabel={`${f.label}: ${f.value}. ${f.detail}`} accessibilityHint={t.sourceHint}>
                <View style={[styles.row, {gap: spacing.md}]}>
                  <IconTile name={group.icon} color={hueAt(colors, groups.findIndex(g => g.group.id === group.id))} size={36} />
                  <View style={styles.flex}>
                    <Text variant="caption" color="textMuted">
                      {f.label}
                    </Text>
                    <Text variant="heading">{f.value}</Text>
                  </View>
                </View>
                <Text variant="body" style={{marginTop: spacing.sm}}>
                  {f.detail}
                </Text>
                <View style={[styles.row, {gap: 4, marginTop: spacing.sm}]}>
                  <Icon name="book" size={13} color="textFaint" />
                  <Text variant="caption" color="textFaint">
                    {sourceLabel(f.source, stateInfo.handbook.url)}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </View>
      ))}

      {stateInfo.notableLaws.length ? (
        <>
          <SectionHeader title={t.onlyIn(stateInfo.name)} />
          <View style={{gap: spacing.sm}}>
            {stateInfo.notableLaws.map(l => (
              <Card key={l.title} style={{borderLeftWidth: 4, borderLeftColor: colors.accent, borderRadius: radius.md}}>
                <Text variant="bodyStrong">{l.title}</Text>
                <Text variant="body" color="textMuted" style={{marginTop: 4}}>
                  {l.summary}
                </Text>
              </Card>
            ))}
          </View>
        </>
      ) : null}

      <View style={{gap: spacing.md, marginTop: spacing.xl}}>
        <Button title={t.flashcards} icon="layers" onPress={() => navigation.navigate('FactCards')} fullWidth />
        <Button
          title={t.share}
          variant="outline"
          icon="share"
          onPress={() =>
            Share.share({
              title: t.shareTitle(stateInfo.name),
              message: [
                t.shareHeader(stateInfo.name),
                ...groups.flatMap(g => ['', g.group.title.toUpperCase(), ...g.facts.map(f => `\u2022 ${f.label}: ${f.value}`)]),
                '',
                t.shareSource(`${stateInfo.handbook.title}${stateInfo.handbook.edition ? ` (${stateInfo.handbook.edition})` : ''}`),
              ].join('\n'),
            })
          }
          fullWidth
        />
        <Button
          title={t.readAloud}
          variant="outline"
          icon="volume"
          onPress={() => speech.speak(groups.flatMap(g => g.facts.map(f => `${f.label}: ${f.value}.`)).join(' '))}
          fullWidth
        />
        <Text variant="caption" color="textFaint" align="center">
          {t.lawsChange}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
});
