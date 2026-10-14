import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Card, Divider, Icon, IconName, ListRow, Screen, SectionHeader, Text} from '../../components';
import {getTopic} from '../../data/tracks';
import {useLearner} from '../../hooks/useLearner';
import {defineStrings, useStrings} from '../../i18n';
import type {RootScreenProps} from '../../navigation/types';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {openOfficial} from '../quiz/ExamIntroScreen';

const CHECKLIST_ICONS: IconName[] = ['id-card', 'clipboard', 'eye', 'landmark', 'calendar', 'clock'];

const STR = defineStrings(
  {
    checklist: [
      'Identity and residency documents your agency requires (check its website — REAL ID rules may apply).',
      'Completed application and, for teens, parent/guardian consent if required.',
      'Glasses or contacts — most offices give a vision test.',
      'Fee payment (amounts and accepted payment types vary by state).',
      'Appointment confirmation if your office requires one.',
      'Arrive early; allow time for paperwork, photo and vision screening.',
    ],
    tips: [
      'Read every answer choice before choosing — the first "pretty good" option is often a trap.',
      'Watch for qualifiers like always, never, only, except and unless.',
      'Numbers matter: know your state’s distances, BAC limits and ages from the cheat sheet.',
      'If unsure, eliminate answers you know are wrong and choose the safest legal action.',
      'Don’t rush — most knowledge tests have plenty of time.',
    ],
    questions: 'Questions',
    toPass: 'Correct answers to pass',
    timeLimit: 'Time limit',
    minutes: (n: number) => `${n} minutes`,
    notStated: 'Not stated',
    roadSigns: 'Road signs section',
    format: 'Format',
    languages: 'Languages',
    ifFail: 'If you fail',
    practiceExam: 'Take a practice exam',
    heading: (state: string, short: string) => `${state} ${short} knowledge test`,
    givenBy: (agency: string) => `Given by the ${agency}.`,
    testFormat: 'Test format',
    officialInfo: 'Official test information',
    officialInfoLink: 'the official test page',
    cdlTests: 'CDL knowledge tests',
    examSub: (questions: number, pass: number) => `${questions} questions · ${pass} to pass`,
    bring: 'What to bring',
    checkRequirements: (agency: string) => `Check the ${agency} requirements`,
    websiteLink: (agency: string) => `the ${agency} website`,
    tipsTitle: 'Test-taking tips',
  },
  {
    checklist: [
      'Documentos de identidad y residencia que pide tu agencia (revisa su sitio web; pueden aplicar las reglas de REAL ID).',
      'Solicitud completa y, para menores, el consentimiento de padre/madre o tutor si se requiere.',
      'Lentes o lentes de contacto: la mayoría de las oficinas hacen un examen de la vista.',
      'Pago de la tarifa (los montos y las formas de pago aceptadas varían según el estado).',
      'Confirmación de tu cita si tu oficina la requiere.',
      'Llega temprano; deja tiempo para el papeleo, la foto y el examen de la vista.',
    ],
    tips: [
      'Lee todas las opciones antes de elegir: la primera que parece “bastante buena” suele ser una trampa.',
      'Fíjate en palabras como siempre, nunca, solo, excepto y a menos que.',
      'Los números importan: aprende las distancias, los límites de BAC y las edades de tu estado con la hoja de repaso.',
      'Si tienes dudas, descarta las respuestas que sabes que son incorrectas y elige la acción legal más segura.',
      'No te apresures: la mayoría de los exámenes de conocimientos dan tiempo de sobra.',
    ],
    questions: 'Preguntas',
    toPass: 'Respuestas correctas para aprobar',
    timeLimit: 'Límite de tiempo',
    minutes: (n: number) => (n === 1 ? '1 minuto' : `${n} minutos`),
    notStated: 'No especificado',
    roadSigns: 'Sección de señales de tránsito',
    format: 'Formato',
    languages: 'Idiomas',
    ifFail: 'Si repruebas',
    practiceExam: 'Hacer un examen de práctica',
    heading: (state: string, short: string) => `Examen de conocimientos de ${state} (${short})`,
    givenBy: (agency: string) => `Aplicado por: ${agency}.`,
    testFormat: 'Formato del examen',
    officialInfo: 'Información oficial del examen',
    officialInfoLink: 'la página oficial del examen',
    cdlTests: 'Exámenes de conocimientos de CDL',
    examSub: (questions: number, pass: number) => `${questions} preguntas · ${pass} para aprobar`,
    bring: 'Qué llevar',
    checkRequirements: (agency: string) => `Revisa los requisitos de ${agency}`,
    websiteLink: (agency: string) => `el sitio web de ${agency}`,
    tipsTitle: 'Consejos para el examen',
  },
);

export function ExamInfoScreen({navigation}: RootScreenProps<'ExamInfo'>) {
  const {colors, spacing} = useTheme();
  const t = useStrings(STR);
  const {stateInfo, exams, exam, trackMeta} = useLearner();
  const e = stateInfo.exam;
  const rows: [string, string | null][] =
    trackMeta.id === 'car'
      ? [
          [t.questions, String(e.questions)],
          [t.toPass, `${e.passingScore} (${Math.round(e.passingPercent)}%)`],
          [t.timeLimit, e.timeLimitMinutes ? t.minutes(e.timeLimitMinutes) : t.notStated],
          [t.roadSigns, e.roadSigns],
          [t.format, e.format],
          [t.languages, e.languages],
          [t.ifFail, e.retestWait],
        ]
      : [
          [t.questions, String(exam.questions)],
          [t.toPass, String(exam.passingScore)],
          [t.timeLimit, exam.timeLimitMinutes ? t.minutes(exam.timeLimitMinutes) : t.notStated],
        ];

  return (
    <Screen
      footer={<Button title={t.practiceExam} icon="clipboard-check" onPress={() => navigation.navigate('ExamIntro', {})} fullWidth />}>
      <Text variant="title" accessibilityRole="header">
        {t.heading(stateInfo.name, trackMeta.short)}
      </Text>
      <Text variant="body" color="textMuted" style={{marginTop: spacing.xs}}>
        {t.givenBy(stateInfo.agency.name)}
      </Text>

      <SectionHeader title={t.testFormat} />
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
          title={t.officialInfo}
          variant="ghost"
          size="sm"
          icon="external"
          onPress={() => openOfficial((trackMeta.id === 'car' ? e.sourceUrl : exam.sourceUrl) ?? '', t.officialInfoLink)}
          style={styles.left}
        />
      ) : null}

      {exams.length > 1 ? (
        <>
          <SectionHeader title={t.cdlTests} />
          <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
            {exams.map((x, i) => {
              const meta = x.topic ? getTopic(x.topic) : undefined;
              return (
                <React.Fragment key={x.id}>
                  {i ? <Divider /> : null}
                  <ListRow
                    title={meta?.title ?? x.title}
                    subtitle={t.examSub(x.questions, x.passingScore)}
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

      <SectionHeader title={t.bring} />
      <Card style={{gap: spacing.md}}>
        {t.checklist.map((text, i) => (
          <View key={text} style={[styles.row, styles.top, {gap: spacing.md}]}>
            <Icon name={CHECKLIST_ICONS[i]} size={20} color={colors.primary} />
            <Text variant="body" style={styles.flex}>
              {text}
            </Text>
          </View>
        ))}
        {stateInfo.agency.website ? (
          <Button title={t.checkRequirements(stateInfo.agency.abbreviation)} variant="outline" size="sm" icon="external" onPress={() => openOfficial(stateInfo.agency.website, t.websiteLink(stateInfo.agency.abbreviation))} />
        ) : null}
      </Card>

      <SectionHeader title={t.tipsTitle} />
      <Card style={{gap: spacing.md}}>
        {t.tips.map(tip => (
          <View key={tip} style={[styles.row, styles.top, {gap: spacing.md}]}>
            <Icon name="lightbulb" size={18} color={colors.warning} />
            <Text variant="body" style={styles.flex}>
              {tip}
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
