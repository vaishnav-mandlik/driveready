import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Card, Chip, Icon, ProgressBar, Screen, SectionHeader, Text} from '../../components';
import type {TopicMeta} from '../../data/tracks';
import {addDays, dayKey, daysUntil, parseDayKey} from '../../engine/dates';
import {useLearner} from '../../hooks/useLearner';
import type {RootScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {useSettings} from '../../store/settings';
import {useTheme} from '../../theme/ThemeProvider';
import {relativeDayLabel} from '../practice/shared/format';
import {useNow, useTopicProgress} from '../practice/shared/hooks';
import type {TopicProgress} from '../practice/shared/practiceData';

export interface PlanDay {
  key: string;
  offset: number;
  target: number;
  focus: TopicMeta[];
  tasks: string[];
  final: boolean;
}

/**
 * Spreads the remaining work (unseen questions + mistakes) over the days left,
 * weakest/least-practiced topics first, finishing with exam simulations.
 */
export function buildPlan(
  topics: TopicMeta[],
  progress: Map<string, TopicProgress>,
  daysLeft: number,
  dailyGoal: number,
  today: string,
): PlanDay[] {
  const withQs = topics.filter(t => (progress.get(t.id)?.total ?? 0) > 0);
  const order = [...withQs].sort((a, b) => {
    const pa = progress.get(a.id)!;
    const pb = progress.get(b.id)!;
    const ca = pa.seen / pa.total + (pa.accuracy ?? 0.5) * 0.5;
    const cb = pb.seen / pb.total + (pb.accuracy ?? 0.5) * 0.5;
    return ca - cb;
  });
  let unseen = 0;
  let mistakes = 0;
  for (const t of withQs) {
    const p = progress.get(t.id)!;
    unseen += p.total - p.seen;
    mistakes += p.mistakes;
  }
  const n = Math.max(1, Math.min(60, daysLeft));
  const studyDays = Math.max(1, n - (n >= 4 ? 1 : 0));
  const target = Math.max(dailyGoal, Math.ceil((unseen + mistakes) / studyDays));
  const perDay = Math.max(1, Math.ceil(order.length / studyDays));
  const days: PlanDay[] = [];
  for (let i = 0; i < n; i++) {
    const key = dayKey(addDays(parseDayKey(today), i));
    const final = n >= 4 && i === n - 1;
    const focus = final || !order.length ? [] : order.slice((i * perDay) % order.length, ((i * perDay) % order.length) + perDay);
    const tasks: string[] = [];
    if (final) {
      tasks.push('Take 2 full exam simulations', 'Clear your remaining mistakes', 'Skim your State Cheat Sheet');
    } else {
      tasks.push(`Answer ${target} questions`);
      if (focus.length) {
        tasks.push(`Focus: ${focus.map(f => f.title).join(', ')}`);
      }
      if (i % 3 === 2 || i === n - 2) {
        tasks.push('Take one exam simulation');
      }
      if (mistakes > 0 || i > 0) {
        tasks.push('Review your mistakes');
      }
    }
    days.push({key, offset: i, target: final ? 0 : target, focus, tasks, final});
  }
  return days;
}

export function StudyPlanScreen({navigation}: RootScreenProps<'StudyPlan'>) {
  const {colors, spacing} = useTheme();
  const {trackMeta} = useLearner();
  const now = useNow(navigation);
  const progress = useTopicProgress(now);
  const examDate = useSettings(s => s.examDate);
  const dailyGoal = useSettings(s => s.dailyGoal);
  const days = useProgress(s => s.days);
  const today = dayKey(now);
  const left = examDate ? Math.max(1, daysUntil(examDate, now)) : 14;
  const plan = useMemo(
    () => buildPlan(trackMeta.topics, progress as Map<string, TopicProgress>, left, dailyGoal, today),
    [trackMeta, progress, left, dailyGoal, today],
  );
  const todayDone = days[today]?.q ?? 0;

  return (
    <Screen>
      <Card variant="tinted" tint={colors.primarySoft}>
        <Text variant="heading" accessibilityRole="header">
          {examDate ? `${left} day${left === 1 ? '' : 's'} to your test` : 'Your 2-week plan'}
        </Text>
        <Text variant="body" color="textMuted" style={{marginTop: spacing.xs}}>
          {examDate
            ? 'A day-by-day plan that covers every question before test day, weakest topics first.'
            : 'No test date set — here is a two-week plan. Set a date for a personalized countdown.'}
        </Text>
        {!examDate ? (
          <Button title="Set test date" variant="outline" size="sm" icon="calendar" onPress={() => navigation.navigate('Goal', {mode: 'change'})} style={{marginTop: spacing.md, alignSelf: 'flex-start'}} />
        ) : null}
      </Card>

      <SectionHeader title="Plan" />
      <View style={{gap: spacing.md}}>
        {plan.map(day => {
          const isToday = day.key === today;
          const answered = days[day.key]?.q ?? 0;
          return (
            <Card key={day.key} style={isToday ? {borderWidth: 2, borderColor: colors.primary} : undefined}>
              <View style={[styles.row, {gap: spacing.sm}]}>
                <Text variant="bodyStrong" style={styles.flex}>
                  {relativeDayLabel(day.key, day.offset)}
                </Text>
                {day.final ? <Chip label="Final review" icon="flag" tone="accent" /> : null}
                {isToday && todayDone >= day.target && day.target > 0 ? <Chip label="Done" icon="check" tone="success" /> : null}
              </View>
              <View style={{gap: 6, marginTop: spacing.sm}}>
                {day.tasks.map(t => (
                  <View key={t} style={[styles.row, {gap: spacing.sm}]}>
                    <Icon name="circle-dot" size={14} color="textFaint" />
                    <Text variant="body" style={styles.flex}>
                      {t}
                    </Text>
                  </View>
                ))}
              </View>
              {isToday && day.target ? (
                <>
                  <ProgressBar value={answered / day.target} height={6} style={{marginTop: spacing.md}} accessibilityLabel="Today's progress" />
                  <Button
                    title={day.focus[0] ? `Practice ${day.focus[0].title}` : 'Start practicing'}
                    icon="play"
                    size="sm"
                    onPress={() => (day.focus[0] ? navigation.navigate('Topic', {topic: day.focus[0].id}) : navigation.navigate('Quiz', {spec: {mode: 'practice'}}))}
                    style={{marginTop: spacing.md, alignSelf: 'flex-start'}}
                  />
                </>
              ) : null}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
});
