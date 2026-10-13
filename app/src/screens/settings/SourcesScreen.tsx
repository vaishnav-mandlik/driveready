import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, Divider, Icon, ListRow, Screen, SectionHeader, Text} from '../../components';
import {DISCLAIMER} from '../../config';
import {useLearner} from '../../hooks/useLearner';
import type {RootScreenProps} from '../../navigation/types';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {openOfficial} from '../quiz/ExamIntroScreen';

const GENERAL: {title: string; subtitle: string; url: string}[] = [
  {title: 'Manual on Uniform Traffic Control Devices (MUTCD)', subtitle: 'U.S. Federal Highway Administration — road signs, signals and markings', url: 'https://mutcd.fhwa.dot.gov/'},
  {title: 'Motorcycle Operator Manual', subtitle: 'Motorcycle Safety Foundation', url: 'https://www.msf-usa.org/'},
  {title: 'Commercial Driver’s License Program', subtitle: 'Federal Motor Carrier Safety Administration (FMCSA)', url: 'https://www.fmcsa.dot.gov/registration/commercial-drivers-license'},
  {title: 'NHTSA — Teen & Distracted Driving', subtitle: 'National Highway Traffic Safety Administration', url: 'https://www.nhtsa.gov/'},
];

export function SourcesScreen(_props: RootScreenProps<'Sources'>) {
  const {colors, spacing} = useTheme();
  const {stateInfo} = useLearner();
  const external = <Icon name="external" size={18} color="textFaint" />;
  return (
    <Screen>
      <Card variant="tinted" tint={colors.warningSoft}>
        <Text variant="bodyStrong">Not a government app</Text>
        <Text variant="body" style={{marginTop: spacing.xs}}>
          {DISCLAIMER}
        </Text>
      </Card>

      <SectionHeader title={`${stateInfo.name} — official sources`} />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        {stateInfo.handbook.url ? (
          <ListRow
            title={stateInfo.handbook.title}
            subtitle={`Official driver handbook${stateInfo.handbook.edition ? ` (${stateInfo.handbook.edition})` : ''}`}
            icon="book"
            iconColor={hueAt(colors, 0)}
            right={external}
            chevron={false}
            onPress={() => openOfficial(stateInfo.handbook.url, 'the official handbook')}
          />
        ) : null}
        {stateInfo.agency.website ? (
          <>
            <Divider />
            <ListRow title={stateInfo.agency.name} subtitle={stateInfo.agency.website.replace(/^https?:\/\//, '')} icon="landmark" iconColor={hueAt(colors, 7)} right={external} chevron={false} onPress={() => openOfficial(stateInfo.agency.website, 'the agency website')} />
          </>
        ) : null}
        {stateInfo.exam.sourceUrl ? (
          <>
            <Divider />
            <ListRow title="Knowledge test information" subtitle={stateInfo.exam.sourceUrl.replace(/^https?:\/\//, '')} icon="clipboard-check" iconColor={hueAt(colors, 3)} right={external} chevron={false} onPress={() => openOfficial(stateInfo.exam.sourceUrl, 'the official test page')} />
          </>
        ) : null}
        {!stateInfo.handbook.url && !stateInfo.agency.website ? <ListRow title="Official links for this state are coming soon" icon="info" /> : null}
      </Card>
      {stateInfo.verifiedOn ? (
        <Text variant="caption" color="textMuted" style={{marginTop: spacing.sm}}>
          State rules in this app were checked against these sources on {stateInfo.verifiedOn}. Each fact in the cheat sheet shows the handbook page and wording it comes from.
        </Text>
      ) : null}

      <SectionHeader title="National sources" />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        {GENERAL.map((g, i) => (
          <React.Fragment key={g.url}>
            {i ? <Divider /> : null}
            <ListRow title={g.title} subtitle={g.subtitle} icon="shield-check" iconColor={hueAt(colors, 5)} right={external} chevron={false} onPress={() => openOfficial(g.url, g.title)} />
          </React.Fragment>
        ))}
      </Card>
      <Text variant="caption" color="textFaint" style={[styles.note, {marginTop: spacing.lg}]}>
        Found something outdated? Use "Report a problem" on any question — we fix content quickly.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: {textAlign: 'center'},
});
