import React, {useCallback, useEffect, useLayoutEffect} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, useWindowDimensions, View} from 'react-native';
import {Button, Card, EmptyState, Icon, IconButton, Screen, SignImage, Text} from '../../components';
import {getSign, isScenario} from '../../data/signs';
import {getLesson} from '../../data/lessons';
import type {LessonBlock, TopicId} from '../../data/types';
import {defineStrings, useStrings} from '../../i18n';
import {speech} from '../../native';
import type {RootScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {useTheme} from '../../theme/ThemeProvider';

const STR = defineStrings(
  {
    readAloud: 'Read lesson aloud',
    keyPointsSpoken: 'Key points.',
    notFound: 'Lesson not found',
    notAvailable: "This lesson isn't available.",
    goBack: 'Go back',
    minRead: (n: number) => `${n} min read`,
    readSuffix: ' · Read',
    keyPoints: 'Key points',
    practice: 'Practice this topic',
    markRead: 'Mark as read',
  },
  {
    readAloud: 'Leer la lección en voz alta',
    keyPointsSpoken: 'Puntos clave.',
    notFound: 'Lección no encontrada',
    notAvailable: 'Esta lección no está disponible.',
    goBack: 'Regresar',
    minRead: (n: number) => `${n} min de lectura`,
    readSuffix: ' · Leída',
    keyPoints: 'Puntos clave',
    practice: 'Practicar este tema',
    markRead: 'Marcar como leída',
  },
);

function blockText(b: LessonBlock): string {
  switch (b.type) {
    case 'p':
    case 'tip':
    case 'warning':
      return b.text;
    case 'bullets':
    case 'steps':
      return b.items.join('. ');
    case 'table':
      return b.rows.map(r => `${r[0]}: ${r[1]}`).join('. ');
    case 'sign':
      return b.caption ?? getSign(b.code)?.name ?? '';
    case 'signs':
      return b.codes.map(c => getSign(c)?.name ?? '').join(', ');
  }
}

export function LessonScreen({navigation, route}: RootScreenProps<'Lesson'>) {
  const {colors, spacing, radius} = useTheme();
  const t = useStrings(STR);
  const lesson = getLesson(route.params.lessonId);
  const read = useProgress(s => (lesson ? !!s.lessonsRead[lesson.id] : false));
  const markRead = useProgress(s => s.markLessonRead);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: lesson?.title ?? '',
      headerRight: lesson
        ? () => (
            <IconButton
              icon="volume"
              accessibilityLabel={t.readAloud}
              onPress={() => {
                speech.stop();
                speech.speak([lesson.title, ...lesson.sections.flatMap(s => [s.heading, ...s.blocks.map(blockText)]), t.keyPointsSpoken, ...lesson.keyPoints].join('. '));
              }}
            />
          )
        : undefined,
    });
  }, [navigation, lesson, t]);

  useEffect(() => () => speech.stop(), []);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {layoutMeasurement, contentOffset, contentSize} = e.nativeEvent;
      if (lesson && !read && layoutMeasurement.height + contentOffset.y >= contentSize.height - 80) {
        markRead(lesson.id);
      }
    },
    [lesson, read, markRead],
  );

  if (!lesson) {
    return (
      <Screen>
        <EmptyState icon="book" title={t.notFound} message={t.notAvailable} actionLabel={t.goBack} onAction={() => navigation.goBack()} />
      </Screen>
    );
  }

  const isTopic = lesson.topic !== 'road-test';

  return (
    <Screen scroll={false} padded={false}>
      <ScrollView onScroll={onScroll} scrollEventThrottle={200} contentContainerStyle={{padding: spacing.lg, paddingBottom: spacing.huge}}>
        <Text variant="title" accessibilityRole="header">
          {lesson.title}
        </Text>
        <View style={[styles.row, {gap: spacing.sm, marginTop: spacing.xs}]}>
          <Icon name="clock" size={14} color="textMuted" />
          <Text variant="caption" color="textMuted">
            {t.minRead(lesson.minutes)}
            {read ? t.readSuffix : ''}
          </Text>
        </View>
        <Text variant="body" color="textMuted" style={{marginTop: spacing.md}}>
          {lesson.summary}
        </Text>

        {lesson.sections.map((section, si) => (
          <View key={si} style={{marginTop: spacing.xxl, gap: spacing.md}}>
            <Text variant="heading" accessibilityRole="header">
              {section.heading}
            </Text>
            {section.blocks.map((b, bi) => (
              <Block key={bi} block={b} />
            ))}
          </View>
        ))}

        <Card variant="tinted" tint={colors.primarySoft} style={{marginTop: spacing.xxl}}>
          <View style={[styles.row, {gap: spacing.sm, marginBottom: spacing.sm}]}>
            <Icon name="star" size={18} color={colors.primary} />
            <Text variant="label" color="primary">
              {t.keyPoints}
            </Text>
          </View>
          <View style={{gap: spacing.sm}}>
            {lesson.keyPoints.map((k, i) => (
              <View key={i} style={[styles.row, styles.top, {gap: spacing.sm}]}>
                <Icon name="check" size={16} color={colors.primary} />
                <Text variant="body" style={styles.flex}>
                  {k}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={{gap: spacing.md, marginTop: spacing.xl}}>
          {isTopic ? (
            <Button title={t.practice} icon="play" onPress={() => navigation.navigate('Quiz', {spec: {mode: 'practice', topic: lesson.topic as TopicId, count: 10, title: lesson.title}})} fullWidth />
          ) : null}
          {!read ? <Button title={t.markRead} variant="outline" icon="check" onPress={() => markRead(lesson.id)} fullWidth /> : null}
        </View>
        <View style={{height: radius.lg}} />
      </ScrollView>
    </Screen>
  );
}

function Block({block}: {block: LessonBlock}) {
  const {colors, spacing, radius} = useTheme();
  const {width} = useWindowDimensions();
  switch (block.type) {
    case 'p':
      return <Text variant="body">{block.text}</Text>;
    case 'bullets':
      return (
        <View style={{gap: spacing.sm}}>
          {block.items.map((item, i) => (
            <View key={i} style={[styles.row, styles.top, {gap: spacing.sm}]}>
              <View style={[styles.bullet, {backgroundColor: colors.primary}]} />
              <Text variant="body" style={styles.flex}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      );
    case 'steps':
      return (
        <View style={{gap: spacing.sm}}>
          {block.items.map((item, i) => (
            <View key={i} style={[styles.row, styles.top, {gap: spacing.md}]}>
              <View style={[styles.step, {backgroundColor: colors.primarySoft}]}>
                <Text variant="captionStrong" color="primary">
                  {i + 1}
                </Text>
              </View>
              <Text variant="body" style={styles.flex}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      );
    case 'tip':
    case 'warning': {
      const warn = block.type === 'warning';
      return (
        <View style={[styles.row, styles.top, {gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: warn ? colors.warningSoft : colors.successSoft}]}>
          <Icon name={warn ? 'warning' : 'lightbulb'} size={20} color={warn ? colors.warning : colors.success} />
          <Text variant="body" style={styles.flex}>
            {block.text}
          </Text>
        </View>
      );
    }
    case 'sign': {
      // Scenario illustrations are wide pictures: use the full content width.
      const scene = isScenario(block.code);
      return (
        <View style={[styles.signBox, {backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: scene ? spacing.sm : spacing.lg}]}>
          <SignImage code={block.code} size={scene ? Math.min(width - 2 * spacing.lg - 2 * spacing.sm, 420) : 120} />
          {block.caption ?? getSign(block.code)?.name ? (
            <Text variant="caption" color="textMuted" align="center" style={{marginTop: spacing.sm}}>
              {block.caption ?? getSign(block.code)?.name}
            </Text>
          ) : null}
        </View>
      );
    }
    case 'signs':
      return (
        <View style={[styles.signRow, {gap: spacing.md}]}>
          {block.codes.map(code => (
            <View key={code} style={[styles.signCell, {backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.sm}]}>
              <SignImage code={code} size={72} />
              <Text variant="caption" align="center" numberOfLines={2} style={{marginTop: 4}}>
                {getSign(code)?.name ?? code}
              </Text>
            </View>
          ))}
        </View>
      );
    case 'table':
      return (
        <View style={[styles.table, {borderColor: colors.border, borderRadius: radius.md}]}>
          {block.rows.map((r, i) => (
            <View key={i} style={[styles.row, styles.top, {padding: spacing.md, gap: spacing.md, backgroundColor: i % 2 ? colors.surface : colors.surfaceAlt}]}>
              <Text variant="bodyStrong" style={styles.flex}>
                {r[0]}
              </Text>
              <Text variant="body" style={styles.flex}>
                {r[1]}
              </Text>
            </View>
          ))}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  top: {alignItems: 'flex-start'},
  bullet: {width: 7, height: 7, borderRadius: 4, marginTop: 8},
  step: {width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center'},
  signBox: {alignItems: 'center'},
  signRow: {flexDirection: 'row', flexWrap: 'wrap'},
  signCell: {width: 96, alignItems: 'center'},
  table: {borderWidth: 1, overflow: 'hidden'},
});
