import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Card, Divider, Icon, IconName, ListRow, Screen, SectionHeader, Text} from '../../components';
import {getTopic} from '../../data/tracks';
import {useLearner} from '../../hooks/useLearner';
import type {RootScreenProps} from '../../navigation/types';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {openOfficial} from '../quiz/ExamIntroScreen';

const CHECKLIST: {icon: IconName; text: string}[] = [
  {icon: 'id-card', text: 'Identity and residency documents your agency requires (check its website — REAL ID rules may apply).'},
  {icon: 'clipboard', text: 'Completed application and, for teens, parent/guardian consent if required.'},
  {icon: 'eye', text: 'Glasses or contacts — most offices give a vision test.'},
  {icon: 'landmark', text: 'Fee payment (amounts and accepted payment types vary by state).'},
  {icon: 'calendar', text: 'Appointment confirmation if your office requires one.'},
  {icon: 'clock', text: 'Arrive early; allow time for paperwork, photo and vision screening.'},
];

const TIPS = [
  'Read every answer choice before choosing — the first "pretty good" option is often a trap.',
  'Watch for qualifiers like always, never, only, except and unless.',
  'Numbers matter: know your state’s distances, BAC limits and ages from the cheat sheet.',
  'If unsure, eliminate answers you know are wrong and choose the safest legal action.',
  'Don’t rush — most knowledge tests have plenty of time.',
];

export function ExamInfoScreen({navigation}: RootScreenProps<'ExamInfo'>) {
  const {colors, spacing} = useTheme();
  const {stateInfo, exams, exam, trackMeta} = useLearner();
  const e = stateInfo.exam;
  const rows: [string, string | null][] =
    trackMeta.id === 'car'
      ? [
          ['Questions', String(e.questions)],
          ['Correct answers to pass', `${e.passingScore} (${Math.round(e.passingPercent)}%)`],
          ['Time limit', e.timeLimitMinutes ? `${e.timeLimitMinutes} minutes` : 'Not stated'],
          ['Road signs section', e.roadSigns],
          ['Format', e.format],
          ['Languages', e.languages],
          ['If you fail', e.retestWait],
        ]
      : [
          ['Questions', String(exam.questions)],
          ['Correct answers to pass', String(exam.passingScore)],
          ['Time limit', exam.timeLimitMinutes ? `${exam.timeLimitMinutes} minutes` : 'Not stated'],
        ];

  return (
    <Screen
      footer={<Button title="Take a practice exam" icon="clipboard-check" onPress={() => navigation.navigate('ExamIntro', {})} fullWidth />}>
      <Text variant="title" accessibilityRole="header">
        {stateInfo.name} {trackMeta.short} knowledge test
      </Text>
      <Text variant="body" color="textMuted" style={{marginTop: spacing.xs}}>
        Given by the {stateInfo.agency.name}.
      </Text>

      <SectionHeader title="Test format" />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        {rows
          .filter((r): r is [string, string] => !!r[1])
          .map(([label, value], i) => (
            <React.Fragment key={label}>
              {i ? <Divider /> : null}
              <View style={[styles.row, {paddingVertical: spacing.md, gap: spacing.md}]}>
                <Text variant="body" color="textMuted" style={styles.flex}>
                  {label}
                </Text>
                <Text variant="bodyStrong" style={styles.value}>
                  {value}
                </Text>
              </View>
            </React.Fragment>
          ))}
      </Card>
      {(trackMeta.id === 'car' ? e.notes : exam.notes) ? (
        <Text variant="caption" color="textMuted" style={{marginTop: spacing.sm}}>
          {trackMeta.id === 'car' ? e.notes : exam.notes}
        </Text>
      ) : null}
      {(trackMeta.id === 'car' ? e.sourceUrl : exam.sourceUrl) ? (
        <Button
          title="Official test information"
          variant="ghost"
          size="sm"
          icon="external"
          onPress={() => openOfficial((trackMeta.id === 'car' ? e.sourceUrl : exam.sourceUrl) ?? '', 'the official test page')}
          style={styles.left}
        />
      ) : null}

      {exams.length > 1 ? (
        <>
          <SectionHeader title="CDL knowledge tests" />
          <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
            {exams.map((x, i) => {
              const meta = x.topic ? getTopic(x.topic) : undefined;
              return (
                <React.Fragment key={x.id}>
                  {i ? <Divider /> : null}
                  <ListRow
                    title={meta?.title ?? x.title}
                    subtitle={`${x.questions} questions · ${x.passingScore} to pass`}
                    icon={meta?.icon ?? 'truck'}
                    iconColor={hueAt(colors, meta?.hue ?? 0)}
                    onPress={() => navigation.navigate('ExamIntro', {examId: x.id})}
                  />
                </React.Fragment>
              );
            })}
          </Card>
        </>
      ) : null}

      <SectionHeader title="What to bring" />
      <Card style={{gap: spacing.md}}>
        {CHECKLIST.map(c => (
          <View key={c.text} style={[styles.row, styles.top, {gap: spacing.md}]}>
            <Icon name={c.icon} size={20} color={colors.primary} />
            <Text variant="body" style={styles.flex}>
              {c.text}
            </Text>
          </View>
        ))}
        {stateInfo.agency.website ? (
          <Button title={`Check the ${stateInfo.agency.abbreviation} requirements`} variant="outline" size="sm" icon="external" onPress={() => openOfficial(stateInfo.agency.website, `the ${stateInfo.agency.abbreviation} website`)} />
        ) : null}
      </Card>

      <SectionHeader title="Test-taking tips" />
      <Card style={{gap: spacing.md}}>
        {TIPS.map(t => (
          <View key={t} style={[styles.row, styles.top, {gap: spacing.md}]}>
            <Icon name="lightbulb" size={18} color={colors.warning} />
            <Text variant="body" style={styles.flex}>
              {t}
            </Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  top: {alignItems: 'flex-start'},
  value: {flexShrink: 1, textAlign: 'right', maxWidth: '55%'},
  left: {alignSelf: 'flex-start', paddingHorizontal: 0, marginTop: 4},
});
