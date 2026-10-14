import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Chip, Divider, Icon, IconTile, LargeHeader, ListRow, Screen, SectionHeader, Text} from '../../components';
import {KEY_NUMBER_FACTS, factLabel} from '../../data/factMeta';
import {getLessons} from '../../data/lessons';
import {getTopic} from '../../data/tracks';
import {useLearner} from '../../hooks/useLearner';
import {defineStrings, useStrings} from '../../i18n';
import type {TabScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {openOfficial} from '../quiz/ExamIntroScreen';

const STR = defineStrings(
  {
    title: 'Learn',
    cheatSheet: (state: string) => `${state} cheat sheet`,
    verifiedCount: (n: number) => `${n} verified rules & numbers`,
    keyRules: 'Key rules and numbers',
    numbersA11y: 'Numbers to know flashcards',
    numbers: 'Numbers to know',
    numbersSub: (state: string) => `Flashcards of ${state}'s distances, ages, limits and penalties`,
    aboutA11y: 'About your test',
    about: (short: string) => `About your ${short} test`,
    aboutSub: (questions: number, pass: number) => `${questions} questions · ${pass} correct to pass · test-day checklist`,
    lessons: 'Lessons',
    lessonsRead: (read: number, total: number) => `Lessons · ${read}/${total} read`,
    minutes: (n: number, summary: string) => `${n} min · ${summary}`,
    read: 'Read',
    noLessons: 'Study lessons for this test are being written. Meanwhile, the cheat sheet and practice questions (with explanations) cover every rule.',
    afterWritten: 'After the written test',
    resources: 'Official resources',
    handbook: 'Official handbook',
    handbookEdition: (edition: string) => `Official handbook · ${edition}`,
    handbookLink: (state: string) => `the official ${state} handbook`,
    website: 'Official website — appointments, fees, documents',
    websiteLink: (agency: string) => `the ${agency} website`,
    sampleTest: 'Official sample test',
    sampleTestLink: 'an official sample test',
    driveLog: 'Driving log',
    driveLogSub: 'Track your supervised practice hours',
    sources: 'Sources & disclaimer',
    sourcesSub: 'Where our information comes from',
  },
  {
    title: 'Aprender',
    cheatSheet: (state: string) => `Hoja de repaso de ${state}`,
    verifiedCount: (n: number) => (n === 1 ? '1 regla o número verificado' : `${n} reglas y números verificados`),
    keyRules: 'Reglas y números clave',
    numbersA11y: 'Tarjetas de estudio de números clave',
    numbers: 'Números clave',
    numbersSub: (state: string) => `Tarjetas de estudio con las distancias, edades, límites y multas de ${state}`,
    aboutA11y: 'Sobre tu examen',
    about: (short: string) => `Sobre tu examen (${short})`,
    aboutSub: (questions: number, pass: number) => `${questions} preguntas · ${pass} correctas para aprobar · qué llevar el día del examen`,
    lessons: 'Lecciones',
    lessonsRead: (read: number, total: number) => `Lecciones · ${read}/${total} leídas`,
    minutes: (n: number, summary: string) => `${n} min · ${summary}`,
    read: 'Leída',
    noLessons: 'Estamos escribiendo las lecciones para este examen. Mientras tanto, la hoja de repaso y las preguntas de práctica (con explicaciones) cubren todas las reglas.',
    afterWritten: 'Después del examen de conocimientos',
    resources: 'Recursos oficiales',
    handbook: 'Manual oficial',
    handbookEdition: (edition: string) => `Manual oficial · ${edition}`,
    handbookLink: (state: string) => `el manual oficial de ${state}`,
    website: 'Sitio web oficial: citas, tarifas, documentos',
    websiteLink: (agency: string) => `el sitio web de ${agency}`,
    sampleTest: 'Examen de muestra oficial',
    sampleTestLink: 'un examen de muestra oficial',
    driveLog: 'Registro de manejo',
    driveLogSub: 'Lleva la cuenta de tus horas de práctica supervisada',
    sources: 'Fuentes y aviso legal',
    sourcesSub: 'De dónde viene nuestra información',
  },
);

export function LearnScreen({navigation}: TabScreenProps<'Learn'>) {
  const {colors, spacing} = useTheme();
  const t = useStrings(STR);
  const {stateInfo, track, trackMeta, exam} = useLearner();
  const lessonsRead = useProgress(s => s.lessonsRead);
  const lessons = useMemo(() => getLessons(track), [track]);
  const topicLessons = lessons.filter(l => l.topic !== 'road-test');
  const roadTest = lessons.find(l => l.topic === 'road-test');
  const keyFacts = useMemo(
    () => KEY_NUMBER_FACTS.map(k => stateInfo.facts.find(f => f.key === k)).filter((f): f is NonNullable<typeof f> => !!f).slice(0, 4),
    [stateInfo],
  );
  const readCount = topicLessons.filter(l => lessonsRead[l.id]).length;

  return (
    <Screen edges={['top']}>
      <LargeHeader title={t.title} subtitle={`${stateInfo.name} · ${trackMeta.title}`} />

      <Card variant="tinted" tint={colors.primarySoft} onPress={() => navigation.navigate('CheatSheet')} accessibilityLabel={t.cheatSheet(stateInfo.name)}>
        <View style={[styles.row, {gap: spacing.md}]}>
          <IconTile name="file" color={colors.primary} size={44} />
          <View style={styles.flex}>
            <Text variant="heading">{t.cheatSheet(stateInfo.name)}</Text>
            <Text variant="caption" color="textMuted">
              {stateInfo.facts.length ? t.verifiedCount(stateInfo.facts.length) : t.keyRules}
            </Text>
          </View>
          <Icon name="chevron-right" color="textFaint" />
        </View>
        {keyFacts.length ? (
          <View style={[styles.grid, {gap: spacing.sm, marginTop: spacing.md}]}>
            {keyFacts.map(f => (
              <View key={f.key} style={[styles.fact, {backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md}]}>
                <Text variant="heading" numberOfLines={1} adjustsFontSizeToFit>
                  {f.value}
                </Text>
                <Text variant="caption" color="textMuted" numberOfLines={2}>
                  {factLabel(f.key)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>

      {stateInfo.facts.length ? (
        <Card style={{marginTop: spacing.md}} onPress={() => navigation.navigate('FactCards')} accessibilityLabel={t.numbersA11y}>
          <View style={[styles.row, {gap: spacing.md}]}>
            <IconTile name="layers" color={hueAt(colors, 3)} size={44} />
            <View style={styles.flex}>
              <Text variant="bodyStrong">{t.numbers}</Text>
              <Text variant="caption" color="textMuted">
                {t.numbersSub(stateInfo.name)}
              </Text>
            </View>
            <Icon name="chevron-right" color="textFaint" />
          </View>
        </Card>
      ) : null}

      <Card style={{marginTop: spacing.md}} onPress={() => navigation.navigate('ExamInfo')} accessibilityLabel={t.aboutA11y}>
        <View style={[styles.row, {gap: spacing.md}]}>
          <IconTile name="info" color={hueAt(colors, 5)} size={44} />
          <View style={styles.flex}>
            <Text variant="bodyStrong">{t.about(trackMeta.short)}</Text>
            <Text variant="caption" color="textMuted">
              {t.aboutSub(exam.questions, exam.passingScore)}
            </Text>
          </View>
          <Icon name="chevron-right" color="textFaint" />
        </View>
      </Card>

      <SectionHeader title={topicLessons.length ? t.lessonsRead(readCount, topicLessons.length) : t.lessons} />
      {topicLessons.length ? (
        <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
          {topicLessons.map((l, i) => {
            const meta = getTopic(l.topic as never);
            const read = !!lessonsRead[l.id];
            return (
              <React.Fragment key={l.id}>
                {i ? <Divider /> : null}
                <ListRow
                  title={l.title}
                  subtitle={t.minutes(l.minutes, l.summary)}
                  icon={meta?.icon ?? 'book'}
                  iconColor={hueAt(colors, meta?.hue ?? 0)}
                  right={read ? <Chip label={t.read} icon="check" tone="success" /> : undefined}
                  onPress={() => navigation.navigate('Lesson', {lessonId: l.id})}
                />
              </React.Fragment>
            );
          })}
        </Card>
      ) : (
        <Card>
          <Text variant="body" color="textMuted">
            {t.noLessons}
          </Text>
        </Card>
      )}

      {roadTest ? (
        <>
          <SectionHeader title={t.afterWritten} />
          <Card onPress={() => navigation.navigate('Lesson', {lessonId: roadTest.id})} accessibilityLabel={roadTest.title}>
            <View style={[styles.row, {gap: spacing.md}]}>
              <IconTile name="car-front" color={hueAt(colors, 1)} size={44} />
              <View style={styles.flex}>
                <Text variant="bodyStrong">{roadTest.title}</Text>
                <Text variant="caption" color="textMuted">
                  {roadTest.summary}
                </Text>
              </View>
              <Icon name="chevron-right" color="textFaint" />
            </View>
          </Card>
        </>
      ) : null}

      <SectionHeader title={t.resources} />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        {stateInfo.handbook.url ? (
          <ListRow
            title={stateInfo.handbook.title}
            subtitle={stateInfo.handbook.edition ? t.handbookEdition(stateInfo.handbook.edition) : t.handbook}
            icon="book"
            iconColor={hueAt(colors, 0)}
            right={<Icon name="external" size={18} color="textFaint" />}
            chevron={false}
            onPress={() => openOfficial(stateInfo.handbook.url, t.handbookLink(stateInfo.name))}
          />
        ) : null}
        {stateInfo.agency.website ? (
          <>
            <Divider />
            <ListRow
              title={stateInfo.agency.name}
              subtitle={t.website}
              icon="landmark"
              iconColor={hueAt(colors, 7)}
              right={<Icon name="external" size={18} color="textFaint" />}
              chevron={false}
              onPress={() => openOfficial(stateInfo.agency.website, t.websiteLink(stateInfo.agency.abbreviation))}
            />
          </>
        ) : null}
        {stateInfo.officialPracticeTests.slice(0, 2).map(url => (
          <React.Fragment key={url}>
            <Divider />
            <ListRow title={t.sampleTest} subtitle={url.replace(/^https?:\/\//, '')} icon="clipboard" iconColor={hueAt(colors, 3)} right={<Icon name="external" size={18} color="textFaint" />} chevron={false} onPress={() => openOfficial(url, t.sampleTestLink)} />
          </React.Fragment>
        ))}
        {track === 'car' ? (
          <>
            <Divider />
            <ListRow title={t.driveLog} subtitle={t.driveLogSub} icon="car-front" iconColor={hueAt(colors, 1)} onPress={() => navigation.navigate('DriveLog')} />
          </>
        ) : null}
        <Divider />
        <ListRow title={t.sources} subtitle={t.sourcesSub} icon="shield-check" iconColor={hueAt(colors, 5)} onPress={() => navigation.navigate('Sources')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  grid: {flexDirection: 'row', flexWrap: 'wrap'},
  fact: {flexBasis: '47%', flexGrow: 1},
});
