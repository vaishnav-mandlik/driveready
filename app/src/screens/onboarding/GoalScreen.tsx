import React, {useState} from 'react';
import {Alert, StyleSheet, TextInput, View} from 'react-native';
import {Button, Card, Chip, Divider, IconButton, Screen, SectionHeader, SegmentedControl, Text, ToggleRow} from '../../components';
import {stateName} from '../../data/states';
import {getTrack} from '../../data/tracks';
import {addDays, dayKey, daysUntil, parseDayKey} from '../../engine/dates';
import {reminders} from '../../native';
import type {RootScreenProps} from '../../navigation/types';
import {useSettings} from '../../store/settings';
import {useTheme} from '../../theme/ThemeProvider';
import {longDate} from '../practice/shared/format';

const GOALS = [10, 20, 30, 50];
const REMINDER_TIMES: {label: string; hour: number}[] = [
  {label: '8 AM', hour: 8},
  {label: '12 PM', hour: 12},
  {label: '5 PM', hour: 17},
  {label: '7 PM', hour: 19},
  {label: '9 PM', hour: 21},
];

export function reminderCopy(state: string | null) {
  return {
    title: 'Time for a quick practice session',
    body: `A few questions a day is the fastest way to pass your ${stateName(state as never)} test.`,
  };
}

export function GoalScreen({navigation, route}: RootScreenProps<'Goal'>) {
  const {colors, spacing, radius, textScale} = useTheme();
  const mode = route.params?.mode ?? 'onboarding';
  const s = useSettings();
  const [examDate, setExamDate] = useState<string | null>(s.examDate);
  const [dailyGoal, setDailyGoal] = useState(s.dailyGoal);
  const [reminderOn, setReminderOn] = useState(s.reminder.enabled);
  const [hour, setHour] = useState(s.reminder.hour);
  const [name, setName] = useState(s.name);
  const [saving, setSaving] = useState(false);

  const shift = (days: number) => {
    const base = examDate ? parseDayKey(examDate) : parseDayKey(dayKey());
    const next = addDays(base, days);
    if (daysUntil(dayKey(next)) < 0) {
      return;
    }
    setExamDate(dayKey(next));
  };

  const save = async () => {
    setSaving(true);
    let enabled = reminderOn;
    if (reminderOn && reminders.isSupported) {
      const copy = reminderCopy(s.state);
      const ok = await reminders.schedule(hour, 0, copy.title, copy.body).catch(() => false);
      if (!ok) {
        enabled = false;
        Alert.alert('Reminders are off', 'Notifications are blocked for DriveReady. You can turn them on later in Settings.');
      }
    } else if (!reminderOn) {
      reminders.cancel();
    }
    s.update({examDate, dailyGoal, name: name.trim(), reminder: {enabled, hour, minute: 0}});
    setSaving(false);
    if (mode === 'onboarding') {
      s.completeOnboarding();
    } else {
      navigation.goBack();
    }
  };

  const until = examDate ? daysUntil(examDate) : null;

  return (
    <Screen
      edges={mode === 'onboarding' ? ['top'] : []}
      footer={
        <Button
          title={mode === 'onboarding' ? 'Start studying' : 'Save'}
          size="lg"
          icon={mode === 'onboarding' ? 'play' : 'check'}
          loading={saving}
          onPress={save}
          fullWidth
          testID="goal-save"
        />
      }>
      {mode === 'onboarding' ? (
        <View style={{gap: spacing.md, marginBottom: spacing.md}}>
          <Text variant="label" color="primary">
            Step 3 of 3
          </Text>
          <Text variant="title" accessibilityRole="header">
            Set your goal
          </Text>
          <Text variant="body" color="textMuted">
            {stateName(s.state)} · {getTrack(s.track).title}. Everything here is optional.
          </Text>
        </View>
      ) : null}

      <SectionHeader title="Test date" />
      <Card>
        <View style={[styles.wrap, {gap: spacing.sm}]}>
          {[
            {label: 'In 1 week', days: 7},
            {label: 'In 2 weeks', days: 14},
            {label: 'In 1 month', days: 30},
          ].map(o => (
            <Chip
              key={o.label}
              label={o.label}
              selected={until === o.days}
              onPress={() => setExamDate(dayKey(addDays(parseDayKey(dayKey()), o.days)))}
            />
          ))}
          <Chip label="Not sure yet" selected={!examDate} onPress={() => setExamDate(null)} />
        </View>
        {examDate ? (
          <View style={[styles.row, {marginTop: spacing.lg, gap: spacing.sm}]}>
            <IconButton icon="minus" accessibilityLabel="One day earlier" onPress={() => shift(-1)} background={colors.surfaceAlt} />
            <View style={styles.flex}>
              <Text variant="bodyStrong" align="center">
                {longDate(parseDayKey(examDate))}
              </Text>
              <Text variant="caption" color="textMuted" align="center">
                {until === 0 ? 'Today' : until === 1 ? 'Tomorrow' : `In ${until} days`}
              </Text>
            </View>
            <IconButton icon="plus" accessibilityLabel="One day later" onPress={() => shift(1)} background={colors.surfaceAlt} />
          </View>
        ) : null}
      </Card>

      <SectionHeader title="Daily goal" />
      <Card>
        <SegmentedControl
          options={GOALS.map(g => ({label: `${g}`, value: g}))}
          value={dailyGoal}
          onChange={setDailyGoal}
        />
        <Text variant="caption" color="textMuted" style={{marginTop: spacing.sm}}>
          Questions per day. {dailyGoal <= 10 ? 'A gentle pace.' : dailyGoal <= 20 ? 'Recommended for most learners.' : 'Great if your test is soon.'}
        </Text>
      </Card>

      {reminders.isSupported ? (
        <>
          <SectionHeader title="Study reminder" />
          <Card padded={false} style={{paddingHorizontal: spacing.lg, paddingBottom: reminderOn ? spacing.lg : 0}}>
            <ToggleRow title="Daily reminder" subtitle="A gentle nudge to keep your streak" icon="bell" value={reminderOn} onValueChange={setReminderOn} />
            {reminderOn ? (
              <>
                <Divider />
                <View style={[styles.wrap, {gap: spacing.sm, marginTop: spacing.md}]}>
                  {REMINDER_TIMES.map(t => (
                    <Chip key={t.hour} label={t.label} selected={hour === t.hour} onPress={() => setHour(t.hour)} />
                  ))}
                </View>
              </>
            ) : null}
          </Card>
        </>
      ) : null}

      <SectionHeader title="Your first name (optional)" />
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="For a friendlier greeting"
        placeholderTextColor={colors.textFaint}
        maxLength={30}
        autoCapitalize="words"
        accessibilityLabel="First name"
        style={[
          styles.input,
          {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, color: colors.text, fontSize: 16 * textScale, paddingHorizontal: spacing.md},
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  wrap: {flexDirection: 'row', flexWrap: 'wrap'},
  input: {borderWidth: 1, minHeight: 50},
});
