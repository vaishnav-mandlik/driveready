import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Chip, Divider, Icon, IconTile, LargeHeader, ListRow, Screen, SectionHeader, Text} from '../../components';
import {KEY_NUMBER_FACTS, factLabel} from '../../data/factMeta';
import {getLessons} from '../../data/lessons';
import {getTopic} from '../../data/tracks';
import {useLearner} from '../../hooks/useLearner';
import type {TabScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {openOfficial} from '../quiz/ExamIntroScreen';

export function LearnScreen({navigation}: TabScreenProps<'Learn'>) {
  const {colors, spacing} = useTheme();
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
      <LargeHeader title="Learn" subtitle={`${stateInfo.name} · ${trackMeta.title}`} />

      <Card variant="tinted" tint={colors.primarySoft} onPress={() => navigation.navigate('CheatSheet')} accessibilityLabel={`${stateInfo.name} cheat sheet`}>
        <View style={[styles.row, {gap: spacing.md}]}>
          <IconTile name="file" color={colors.primary} size={44} />
          <View style={styles.flex}>
            <Text variant="heading">{stateInfo.name} cheat sheet</Text>
            <Text variant="caption" color="textMuted">
              {stateInfo.facts.length ? `${stateInfo.facts.length} verified rules & numbers` : 'Key rules and numbers'}
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
        <Card style={{marginTop: spacing.md}} onPress={() => navigation.navigate('FactCards')} accessibilityLabel="Numbers to know flashcards">
          <View style={[styles.row, {gap: spacing.md}]}>
            <IconTile name="layers" color={hueAt(colors, 3)} size={44} />
            <View style={styles.flex}>
              <Text variant="bodyStrong">Numbers to know</Text>
              <Text variant="caption" color="textMuted">
                Flashcards of {stateInfo.name}'s distances, ages, limits and penalties
              </Text>
            </View>
            <Icon name="chevron-right" color="textFaint" />
          </View>
        </Card>
      ) : null}

      <Card style={{marginTop: spacing.md}} onPress={() => navigation.navigate('ExamInfo')} accessibilityLabel="About your test">
        <View style={[styles.row, {gap: spacing.md}]}>
          <IconTile name="info" color={hueAt(colors, 5)} size={44} />
          <View style={styles.flex}>
            <Text variant="bodyStrong">About your {trackMeta.short} test</Text>
            <Text variant="caption" color="textMuted">
              {exam.questions} questions · {exam.passingScore} correct to pass · test-day checklist
            </Text>
          </View>
          <Icon name="chevron-right" color="textFaint" />
        </View>
      </Card>

      <SectionHeader title={`Lessons${topicLessons.length ? ` · ${readCount}/${topicLessons.length} read` : ''}`} />
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
                  subtitle={`${l.minutes} min · ${l.summary}`}
                  icon={meta?.icon ?? 'book'}
                  iconColor={hueAt(colors, meta?.hue ?? 0)}
                  right={read ? <Chip label="Read" icon="check" tone="success" /> : undefined}
                  onPress={() => navigation.navigate('Lesson', {lessonId: l.id})}
                />
              </React.Fragment>
            );
          })}
        </Card>
      ) : (
        <Card>
          <Text variant="body" color="textMuted">
            Study lessons for this test are being written. Meanwhile, the cheat sheet and practice questions (with explanations) cover every rule.
          </Text>
        </Card>
      )}

      {roadTest ? (
        <>
          <SectionHeader title="After the written test" />
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

      <SectionHeader title="Official resources" />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        {stateInfo.handbook.url ? (
          <ListRow
            title={stateInfo.handbook.title}
            subtitle={`Official handbook${stateInfo.handbook.edition ? ` · ${stateInfo.handbook.edition}` : ''}`}
            icon="book"
            iconColor={hueAt(colors, 0)}
            right={<Icon name="external" size={18} color="textFaint" />}
            chevron={false}
            onPress={() => openOfficial(stateInfo.handbook.url, `the official ${stateInfo.name} handbook`)}
          />
        ) : null}
        {stateInfo.agency.website ? (
          <>
            <Divider />
            <ListRow
              title={stateInfo.agency.name}
              subtitle="Official website — appointments, fees, documents"
              icon="landmark"
              iconColor={hueAt(colors, 7)}
              right={<Icon name="external" size={18} color="textFaint" />}
              chevron={false}
              onPress={() => openOfficial(stateInfo.agency.website, `the ${stateInfo.agency.abbreviation} website`)}
            />
          </>
        ) : null}
        {stateInfo.officialPracticeTests.slice(0, 2).map(url => (
          <React.Fragment key={url}>
            <Divider />
            <ListRow title="Official sample test" subtitle={url.replace(/^https?:\/\//, '')} icon="clipboard" iconColor={hueAt(colors, 3)} right={<Icon name="external" size={18} color="textFaint" />} chevron={false} onPress={() => openOfficial(url, 'an official sample test')} />
          </React.Fragment>
        ))}
        {track === 'car' ? (
          <>
            <Divider />
            <ListRow title="Driving log" subtitle="Track your supervised practice hours" icon="car-front" iconColor={hueAt(colors, 1)} onPress={() => navigation.navigate('DriveLog')} />
          </>
        ) : null}
        <Divider />
        <ListRow title="Sources & disclaimer" subtitle="Where our information comes from" icon="shield-check" iconColor={hueAt(colors, 5)} onPress={() => navigation.navigate('Sources')} />
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
