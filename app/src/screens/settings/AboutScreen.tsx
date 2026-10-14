import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Icon, IconName, Screen, SectionHeader, Text} from '../../components';
import {APP_VERSION, disclaimer} from '../../config';
import {defineStrings, useStrings} from '../../i18n';
import type {RootScreenProps} from '../../navigation/types';
import {useTheme} from '../../theme/ThemeProvider';
import {BrandMark} from '../onboarding/WelcomeScreen';

const ICONS: IconName[] = ['clipboard-check', 'infinity', 'brain', 'signpost', 'file', 'sparkles', 'car-front', 'volume'];

const STR = defineStrings(
  {
    included: [
      'Exam simulator in your state’s real format',
      'Every question — practice, marathon, survival and speed rounds',
      'Mistakes review with spaced repetition',
      'Road-sign library and flashcards',
      'Verified state cheat sheets with official sources',
      'Pass-chance meter, study plan and achievements',
      'Supervised driving log',
      'Read-aloud, large text and dark mode',
    ],
    version: (v: string) => `Version ${v}`,
    freeTitle: 'Every feature free. Forever.',
    freeBody:
      'Other test-prep apps lock their best questions and tools behind subscriptions. DriveReady gives every learner everything — no ads, no account, no paywall, and it works offline.',
    whatsIncluded: "What's included",
    disclaimer: 'Disclaimer',
    credits: 'Credits',
    creditsBody:
      'Road-sign artwork is public-domain artwork of signs from the Manual on Uniform Traffic Control Devices (MUTCD, U.S. Federal Highway Administration), via Wikimedia Commons. Rules and numbers are drawn from each state’s official driver handbook; motorcycle content follows the Motorcycle Safety Foundation’s Motorcycle Operator Manual; CDL content follows the AAMVA model CDL manual and FMCSA rules. Built with React Native and open-source libraries under their respective licenses.',
  },
  {
    included: [
      'Simulador de examen con el formato real de tu estado',
      'Todas las preguntas: práctica, maratón, supervivencia y rondas rápidas',
      'Repaso de errores con repetición espaciada',
      'Biblioteca de señales de tránsito y tarjetas de estudio',
      'Hojas de repaso verificadas de tu estado con fuentes oficiales',
      'Probabilidad de aprobar, plan de estudio y logros',
      'Registro de manejo supervisado',
      'Lectura en voz alta, texto grande y modo oscuro',
    ],
    version: (v: string) => `Versión ${v}`,
    freeTitle: 'Todas las funciones gratis. Siempre.',
    freeBody:
      'Otras apps de preparación bloquean sus mejores preguntas y herramientas tras una suscripción. DriveReady le da todo a cada estudiante: sin anuncios, sin cuenta, sin pagos, y funciona sin conexión.',
    whatsIncluded: 'Qué incluye',
    disclaimer: 'Aviso legal',
    credits: 'Créditos',
    creditsBody:
      'Las imágenes de las señales de tránsito son de dominio público y provienen del Manual on Uniform Traffic Control Devices (MUTCD, U.S. Federal Highway Administration), a través de Wikimedia Commons. Las reglas y cifras provienen del manual oficial del conductor de cada estado; el contenido de motocicleta sigue el Motorcycle Operator Manual de la Motorcycle Safety Foundation; el contenido de CDL sigue el manual modelo de CDL de AAMVA y las normas de la FMCSA. La app está hecha con React Native y bibliotecas de código abierto, bajo sus respectivas licencias.',
  },
);

export function AboutScreen(_props: RootScreenProps<'About'>) {
  const {colors, spacing} = useTheme();
  const t = useStrings(STR);
  return (
    <Screen>
      <View style={styles.center}>
        <BrandMark size={96} />
        <Text variant="title" style={{marginTop: spacing.sm}}>
          DriveReady
        </Text>
        <Text variant="caption" color="textMuted">
          {t.version(APP_VERSION)}
        </Text>
      </View>
      <Card variant="tinted" tint={colors.primarySoft} style={{marginTop: spacing.xl}}>
        <Text variant="heading">{t.freeTitle}</Text>
        <Text variant="body" color="textMuted" style={{marginTop: spacing.sm}}>
          {t.freeBody}
        </Text>
      </Card>
      <SectionHeader title={t.whatsIncluded} />
      <Card style={{gap: spacing.md}}>
        {t.included.map((text, i) => (
          <View key={text} style={[styles.row, {gap: spacing.md}]}>
            <Icon name={ICONS[i]} size={20} color={colors.primary} />
            <Text variant="body" style={styles.flex}>
              {text}
            </Text>
          </View>
        ))}
      </Card>
      <SectionHeader title={t.disclaimer} />
      <Card>
        <Text variant="body">{disclaimer()}</Text>
      </Card>
      <SectionHeader title={t.credits} />
      <Card>
        <Text variant="caption" color="textMuted">
          {t.creditsBody}
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
