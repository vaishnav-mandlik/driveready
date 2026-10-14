import React, {useMemo} from 'react';
import {Alert, AlertButton, Share, StyleSheet, View} from 'react-native';
import {Button, Card, EmptyState, Icon, IconTile, Screen, SectionHeader, Text} from '../../components';
import {groupFacts} from '../../data/factMeta';
import type {SourceRef, StateFact} from '../../data/types';
import {useLearner} from '../../hooks/useLearner';
import {speech} from '../../native';
import type {RootScreenProps} from '../../navigation/types';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {openOfficial} from '../quiz/ExamIntroScreen';

function sourceLabel(source: SourceRef, handbookUrl: string): string {
  if (source.page && (!source.url || source.url === handbookUrl || source.url.endsWith('.pdf'))) {
    return `Handbook p. ${source.page}`;
  }
  return 'Official website';
}

function showSource(fact: StateFact & {label: string}, handbookUrl: string) {
  const buttons: AlertButton[] = [{text: 'Close', style: 'cancel'}];
  if (fact.source.url) {
    buttons.push({text: 'Open source', onPress: () => openOfficial(fact.source.url, 'the official source')});
  }
  Alert.alert(
    `${fact.label} — ${sourceLabel(fact.source, handbookUrl)}`,
    fact.source.quote ? `“${fact.source.quote.trim()}”` : 'Verified against the official source.',
    buttons,
  );
}

export function CheatSheetScreen({navigation}: RootScreenProps<'CheatSheet'>) {
  const {colors, spacing, radius} = useTheme();
  const {stateInfo} = useLearner();
  const groups = useMemo(() => groupFacts(stateInfo.facts), [stateInfo]);

  if (!stateInfo.facts.length) {
    return (
      <Screen>
        <EmptyState
          icon="file"
          title="Cheat sheet coming soon"
          message={`We're verifying ${stateInfo.name}'s rules against the official handbook. Until then, use the official handbook for exact numbers.`}
          actionLabel={stateInfo.handbook.url ? 'Open official handbook' : 'Go back'}
          onAction={() => (stateInfo.handbook.url ? openOfficial(stateInfo.handbook.url, 'the official handbook') : navigation.goBack())}
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
            Verified against the official handbook
          </Text>
        </View>
        <Text variant="caption" color="textMuted" style={{marginTop: spacing.xs}}>
          {stateInfo.handbook.title}
          {stateInfo.handbook.edition ? ` (${stateInfo.handbook.edition})` : ''}
          {stateInfo.verifiedOn ? ` · checked ${stateInfo.verifiedOn}` : ''}. Tap any rule to see the exact wording and page.
        </Text>
      </Card>

      {groups.map(({group, facts}) => (
        <View key={group.id}>
          <SectionHeader title={group.title} />
          <View style={{gap: spacing.sm}}>
            {facts.map(f => (
              <Card key={f.key} onPress={() => showSource(f, stateInfo.handbook.url)} accessibilityLabel={`${f.label}: ${f.value}. ${f.detail}`} accessibilityHint="Shows the official source">
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
          <SectionHeader title={`Only in ${stateInfo.name}`} />
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
        <Button
          title="Share cheat sheet"
          icon="share"
          onPress={() =>
            Share.share({
              title: `${stateInfo.name} driver cheat sheet`,
              message: [
                `${stateInfo.name} driver cheat sheet — from DriveReady (free DMV practice tests)`,
                ...groups.flatMap(g => ['', g.group.title.toUpperCase(), ...g.facts.map(f => `\u2022 ${f.label}: ${f.value}`)]),
                '',
                `Source: ${stateInfo.handbook.title}${stateInfo.handbook.edition ? ` (${stateInfo.handbook.edition})` : ''}. Always confirm with your state's official handbook.`,
              ].join('\n'),
            })
          }
          fullWidth
        />
        <Button
          title="Read the cheat sheet aloud"
          variant="outline"
          icon="volume"
          onPress={() => speech.speak(groups.flatMap(g => g.facts.map(f => `${f.label}: ${f.value}.`)).join(' '))}
          fullWidth
        />
        <Text variant="caption" color="textFaint" align="center">
          Laws change. Always confirm with your state's official handbook before your test.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
});
