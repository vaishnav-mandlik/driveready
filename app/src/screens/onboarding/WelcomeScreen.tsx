import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Path, Rect} from 'react-native-svg';
import {Button, Icon, IconName, Screen, SegmentedControl, Text} from '../../components';
import {disclaimer} from '../../config';
import {defineStrings, LANGUAGES, type Lang, useStrings} from '../../i18n';
import type {RootScreenProps} from '../../navigation/types';
import {useSettings} from '../../store/settings';
import {useTheme} from '../../theme/ThemeProvider';

const ICONS: IconName[] = ['gift', 'clipboard-check', 'brain', 'download'];

const STR = defineStrings(
  {
    title: 'Welcome to DriveReady',
    tagline: 'Pass your DMV knowledge test the first time — 100% free.',
    points: [
      {title: 'Every question free', body: 'No paywall, no ads, no account. Every feature included.'},
      {title: 'Your state’s real format', body: 'Exam simulator matched to your state’s question count and passing score.'},
      {title: 'Learns with you', body: 'Smart review brings back what you miss until you’ve mastered it.'},
      {title: 'Works offline', body: 'Study anywhere — everything is on your phone.'},
    ],
    start: 'Get started',
    independent: 'Independent study app · Not affiliated with any government agency',
    language: 'Language',
  },
  {
    title: 'Bienvenido a DriveReady',
    tagline: 'Aprueba tu examen teórico del DMV a la primera — 100 % gratis.',
    points: [
      {title: 'Todas las preguntas gratis', body: 'Sin pagos, sin anuncios, sin cuenta. Todas las funciones incluidas.'},
      {title: 'El formato real de tu estado', body: 'Simulador de examen con el número de preguntas y la calificación para aprobar de tu estado.'},
      {title: 'Aprende contigo', body: 'El repaso inteligente vuelve a mostrarte lo que fallas hasta que lo domines.'},
      {title: 'Funciona sin conexión', body: 'Estudia donde sea: todo está en tu teléfono.'},
    ],
    start: 'Comenzar',
    independent: 'App de estudio independiente · Sin relación con ninguna agencia del gobierno',
    language: 'Idioma',
  },
);

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
  const t = useStrings(STR);
  const language = useSettings(s => s.language);
  const update = useSettings(s => s.update);
  return (
    <Screen
      edges={['top']}
      footer={
        <View style={{gap: spacing.sm}}>
          <Button title={t.start} size="lg" iconRight="arrow-right" onPress={() => navigation.navigate('PickState', {mode: 'onboarding'})} fullWidth testID="welcome-start" />
          <Text variant="caption" color="textFaint" align="center" accessibilityLabel={disclaimer()}>
            {t.independent}
          </Text>
        </View>
      }>
      <View accessible accessibilityLabel={`${t.language} · Language`} style={{marginTop: spacing.md}}>
        <SegmentedControl<Lang> options={LANGUAGES.map(l => ({label: l.label, value: l.id}))} value={language} onChange={v => update({language: v})} />
      </View>
      <View style={[styles.hero, {backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.xl, marginTop: spacing.md}]}>
        <BrandMark size={96} />
        <Text variant="display" color="#FFFFFF" style={{marginTop: spacing.md}} accessibilityRole="header">
          {t.title}
        </Text>
        <Text variant="subheading" color="#E2ECFF" style={{marginTop: spacing.xs}}>
          {t.tagline}
        </Text>
      </View>
      <View style={{gap: spacing.lg, marginTop: spacing.xxl}}>
        {t.points.map((p, i) => (
          <View key={p.title} style={[styles.point, {gap: spacing.md}]}>
            <View style={[styles.pointIcon, {backgroundColor: colors.primarySoft}]}>
              <Icon name={ICONS[i]} size={22} color={colors.primary} />
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
