import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, Divider, Icon, ListRow, Screen, SectionHeader, Text} from '../../components';
import {disclaimer} from '../../config';
import {parseDayKey} from '../../engine/dates';
import {useLearner} from '../../hooks/useLearner';
import {defineStrings, formatDate, useStrings} from '../../i18n';
import type {RootScreenProps} from '../../navigation/types';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {openOfficial} from '../quiz/ExamIntroScreen';

type Source = {title: string; subtitle: string; url: string};

/** "2026-10-13" → localized short date (other values are shown as they are). */
const dayLabel = (key: string) => (/^\d{4}-\d{2}-\d{2}$/.test(key) ? formatDate(parseDayKey(key)) : key);

const STR = defineStrings(
  {
    general: [
      {title: 'Manual on Uniform Traffic Control Devices (MUTCD)', subtitle: 'U.S. Federal Highway Administration — road signs, signals and markings', url: 'https://mutcd.fhwa.dot.gov/'},
      {title: 'Motorcycle Operator Manual', subtitle: 'Motorcycle Safety Foundation', url: 'https://www.msf-usa.org/'},
      {title: 'Commercial Driver’s License Program', subtitle: 'Federal Motor Carrier Safety Administration (FMCSA)', url: 'https://www.fmcsa.dot.gov/registration/commercial-drivers-license'},
      {title: 'NHTSA — Teen & Distracted Driving', subtitle: 'National Highway Traffic Safety Administration', url: 'https://www.nhtsa.gov/'},
    ] as Source[],
    notGov: 'Not a government app',
    officialSources: (state: string) => `${state} — official sources`,
    handbook: (edition: string) => `Official driver handbook${edition ? ` (${edition})` : ''}`,
    handbookLink: 'the official handbook',
    agencyLink: 'the agency website',
    testInfo: 'Knowledge test information',
    testLink: 'the official test page',
    comingSoon: 'Official links for this state are coming soon',
    verified: (date: string) => `State rules in this app were checked against these sources on ${date}. Each fact in the cheat sheet shows the handbook page and wording it comes from.`,
    national: 'National sources',
    outdated: 'Found something outdated? Use "Report a problem" on any question — we fix content quickly.',
  },
  {
    general: [
      {title: 'Manual on Uniform Traffic Control Devices (MUTCD)', subtitle: 'U.S. Federal Highway Administration — señales de tránsito, semáforos y marcas en el pavimento', url: 'https://mutcd.fhwa.dot.gov/'},
      {title: 'Motorcycle Operator Manual', subtitle: 'Motorcycle Safety Foundation', url: 'https://www.msf-usa.org/'},
      {title: 'Programa de licencias de conducir comerciales (CDL)', subtitle: 'Federal Motor Carrier Safety Administration (FMCSA)', url: 'https://www.fmcsa.dot.gov/registration/commercial-drivers-license'},
      {title: 'NHTSA — Conductores adolescentes y distracciones', subtitle: 'National Highway Traffic Safety Administration', url: 'https://www.nhtsa.gov/'},
    ] as Source[],
    notGov: 'No es una app del gobierno',
    officialSources: (state: string) => `${state}: fuentes oficiales`,
    handbook: (edition: string) => `Manual oficial del conductor${edition ? ` (${edition})` : ''}`,
    handbookLink: 'el manual oficial',
    agencyLink: 'el sitio web de la agencia',
    testInfo: 'Información del examen de conocimientos',
    testLink: 'la página oficial del examen',
    comingSoon: 'Pronto agregaremos los enlaces oficiales de este estado',
    verified: (date: string) => `Las reglas estatales de esta app se verificaron con estas fuentes el ${dayLabel(date)}. Cada dato de la hoja de repaso muestra la página del manual y el texto de donde proviene.`,
    national: 'Fuentes nacionales',
    outdated: '¿Encontraste algo desactualizado? Usa "Reportar un problema" en cualquier pregunta; corregimos el contenido rápidamente.',
  },
);

export function SourcesScreen(_props: RootScreenProps<'Sources'>) {
  const {colors, spacing} = useTheme();
  const {stateInfo} = useLearner();
  const t = useStrings(STR);
  const external = <Icon name="external" size={18} color="textFaint" />;
  return (
    <Screen>
      <Card variant="tinted" tint={colors.warningSoft}>
        <Text variant="bodyStrong">{t.notGov}</Text>
        <Text variant="body" style={{marginTop: spacing.xs}}>
          {disclaimer()}
        </Text>
      </Card>

      <SectionHeader title={t.officialSources(stateInfo.name)} />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        {stateInfo.handbook.url ? (
          <ListRow
            title={stateInfo.handbook.title}
            subtitle={t.handbook(stateInfo.handbook.edition)}
            icon="book"
            iconColor={hueAt(colors, 0)}
            right={external}
            chevron={false}
            onPress={() => openOfficial(stateInfo.handbook.url, t.handbookLink)}
          />
        ) : null}
        {stateInfo.agency.website ? (
          <>
            <Divider />
            <ListRow title={stateInfo.agency.name} subtitle={stateInfo.agency.website.replace(/^https?:\/\//, '')} icon="landmark" iconColor={hueAt(colors, 7)} right={external} chevron={false} onPress={() => openOfficial(stateInfo.agency.website, t.agencyLink)} />
          </>
        ) : null}
        {stateInfo.exam.sourceUrl ? (
          <>
            <Divider />
            <ListRow title={t.testInfo} subtitle={stateInfo.exam.sourceUrl.replace(/^https?:\/\//, '')} icon="clipboard-check" iconColor={hueAt(colors, 3)} right={external} chevron={false} onPress={() => openOfficial(stateInfo.exam.sourceUrl, t.testLink)} />
          </>
        ) : null}
        {!stateInfo.handbook.url && !stateInfo.agency.website ? <ListRow title={t.comingSoon} icon="info" /> : null}
      </Card>
      {stateInfo.verifiedOn ? (
        <Text variant="caption" color="textMuted" style={{marginTop: spacing.sm}}>
          {t.verified(stateInfo.verifiedOn)}
        </Text>
      ) : null}

      <SectionHeader title={t.national} />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        {t.general.map((g, i) => (
          <React.Fragment key={g.url}>
            {i ? <Divider /> : null}
            <ListRow title={g.title} subtitle={g.subtitle} icon="shield-check" iconColor={hueAt(colors, 5)} right={external} chevron={false} onPress={() => openOfficial(g.url, g.title)} />
          </React.Fragment>
        ))}
      </Card>
      <Text variant="caption" color="textFaint" style={[styles.note, {marginTop: spacing.lg}]}>
        {t.outdated}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: {textAlign: 'center'},
});
