import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Icon, IconName, Screen, SectionHeader, Text} from '../../components';
import {APP_VERSION, DISCLAIMER} from '../../config';
import type {RootScreenProps} from '../../navigation/types';
import {useTheme} from '../../theme/ThemeProvider';
import {BrandMark} from '../onboarding/WelcomeScreen';

const INCLUDED: {icon: IconName; text: string}[] = [
  {icon: 'clipboard-check', text: 'Exam simulator in your state’s real format'},
  {icon: 'infinity', text: 'Every question — practice, marathon, survival and speed rounds'},
  {icon: 'brain', text: 'Mistakes review with spaced repetition'},
  {icon: 'signpost', text: 'Road-sign library and flashcards'},
  {icon: 'file', text: 'Verified state cheat sheets with official sources'},
  {icon: 'sparkles', text: 'Pass-chance meter, study plan and achievements'},
  {icon: 'car-front', text: 'Supervised driving log'},
  {icon: 'volume', text: 'Read-aloud, large text and dark mode'},
];

export function AboutScreen(_props: RootScreenProps<'About'>) {
  const {colors, spacing} = useTheme();
  return (
    <Screen>
      <View style={styles.center}>
        <BrandMark size={96} />
        <Text variant="title" style={{marginTop: spacing.sm}}>
          DriveReady
        </Text>
        <Text variant="caption" color="textMuted">
          Version {APP_VERSION}
        </Text>
      </View>
      <Card variant="tinted" tint={colors.primarySoft} style={{marginTop: spacing.xl}}>
        <Text variant="heading">Every feature free. Forever.</Text>
        <Text variant="body" color="textMuted" style={{marginTop: spacing.sm}}>
          Other test-prep apps lock their best questions and tools behind subscriptions. DriveReady gives every learner everything — no ads, no account, no paywall, and it works offline.
        </Text>
      </Card>
      <SectionHeader title="What's included" />
      <Card style={{gap: spacing.md}}>
        {INCLUDED.map(i => (
          <View key={i.text} style={[styles.row, {gap: spacing.md}]}>
            <Icon name={i.icon} size={20} color={colors.primary} />
            <Text variant="body" style={styles.flex}>
              {i.text}
            </Text>
          </View>
        ))}
      </Card>
      <SectionHeader title="Disclaimer" />
      <Card>
        <Text variant="body">{DISCLAIMER}</Text>
      </Card>
      <SectionHeader title="Credits" />
      <Card>
        <Text variant="caption" color="textMuted">
          Road-sign artwork is public-domain artwork of signs from the Manual on Uniform Traffic Control Devices (MUTCD, U.S. Federal Highway Administration), via Wikimedia Commons. Rules and numbers are drawn from each state{'’'}s official driver handbook; motorcycle content follows the Motorcycle Safety Foundation{'’'}s Motorcycle Operator Manual; CDL content follows the AAMVA model CDL manual and FMCSA rules. Built with React Native and open-source libraries under their respective licenses.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  center: {alignItems: 'center'},
});
