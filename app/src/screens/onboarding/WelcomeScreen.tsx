import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Path, Rect} from 'react-native-svg';
import {Button, Icon, IconName, Screen, Text} from '../../components';
import {DISCLAIMER} from '../../config';
import type {RootScreenProps} from '../../navigation/types';
import {useTheme} from '../../theme/ThemeProvider';

const POINTS: {icon: IconName; title: string; body: string}[] = [
  {icon: 'gift', title: 'Every question free', body: 'No paywall, no ads, no account. Every feature included.'},
  {icon: 'clipboard-check', title: 'Your state’s real format', body: 'Exam simulator matched to your state’s question count and passing score.'},
  {icon: 'brain', title: 'Learns with you', body: 'Smart review brings back what you miss until you’ve mastered it.'},
  {icon: 'download', title: 'Works offline', body: 'Study anywhere — everything is on your phone.'},
];

/** The app mark: yellow road-sign diamond with a check. */
export function BrandMark({size = 88}: {size?: number}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 108 108" accessibilityLabel="DriveReady logo">
      <Rect x={33.5} y={33.5} width={41} height={41} rx={5.5} fill="#FFC531" transform="rotate(45 54 54)" />
      <Rect x={36.2} y={36.2} width={35.6} height={35.6} rx={3.9} fill="none" stroke="#14213D" strokeWidth={1.7} transform="rotate(45 54 54)" />
      <Path d="M43.9 54.6 L51.2 61.8 L66.4 46.6" fill="none" stroke="#14213D" strokeWidth={6.1} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function WelcomeScreen({navigation}: RootScreenProps<'Welcome'>) {
  const {colors, spacing, radius} = useTheme();
  return (
    <Screen
      edges={['top']}
      footer={
        <View style={{gap: spacing.sm}}>
          <Button title="Get started" size="lg" iconRight="arrow-right" onPress={() => navigation.navigate('PickState', {mode: 'onboarding'})} fullWidth testID="welcome-start" />
          <Text variant="caption" color="textFaint" align="center" accessibilityLabel={DISCLAIMER}>
            Independent study app · Not affiliated with any government agency
          </Text>
        </View>
      }>
      <View style={[styles.hero, {backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.xl, marginTop: spacing.md}]}>
        <BrandMark size={96} />
        <Text variant="display" color="#FFFFFF" style={{marginTop: spacing.md}} accessibilityRole="header">
          Welcome to DriveReady
        </Text>
        <Text variant="subheading" color="#E2ECFF" style={{marginTop: spacing.xs}}>
          Pass your DMV knowledge test the first time — 100% free.
        </Text>
      </View>
      <View style={{gap: spacing.lg, marginTop: spacing.xxl}}>
        {POINTS.map(p => (
          <View key={p.title} style={[styles.point, {gap: spacing.md}]}>
            <View style={[styles.pointIcon, {backgroundColor: colors.primarySoft}]}>
              <Icon name={p.icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text variant="bodyStrong">{p.title}</Text>
              <Text variant="caption" color="textMuted">
                {p.body}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  hero: {alignItems: 'flex-start'},
  point: {flexDirection: 'row', alignItems: 'center'},
  pointIcon: {width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
});
