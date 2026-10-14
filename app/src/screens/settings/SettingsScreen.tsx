import React from 'react';
import {Alert, Linking, StyleSheet, View} from 'react-native';
import {Card, Chip, Divider, ListRow, Screen, SectionHeader, SegmentedControl, Text, ToggleRow} from '../../components';
import {APP_VERSION, PLAY_STORE_URL, SUPPORT_EMAIL} from '../../config';
import {stateName} from '../../data/states';
import {getTrack} from '../../data/tracks';
import {parseDayKey} from '../../engine/dates';
import {LANGUAGES, type Lang} from '../../i18n';
import {reminders} from '../../native';
import type {RootScreenProps} from '../../navigation/types';
import {useDriveLog} from '../../store/driveLog';
import {useProgress} from '../../store/progress';
import {ThemeMode, useSettings} from '../../store/settings';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {reminderCopy} from '../onboarding/GoalScreen';
import {shortDate} from '../practice/shared/format';

const HOURS = [8, 12, 17, 19, 21];
const hourLabel = (h: number) => (h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`);

export function SettingsScreen({navigation}: RootScreenProps<'Settings'>) {
  const {colors, spacing} = useTheme();
  const s = useSettings();
  const resetProgress = useProgress(p => p.resetProgress);
  const resetLog = useDriveLog(d => d.resetLog);

  const setReminder = async (enabled: boolean, hour = s.reminder.hour) => {
    if (!enabled) {
      reminders.cancel();
      s.update({reminder: {...s.reminder, enabled: false, hour}});
      return;
    }
    const copy = reminderCopy(s.state);
    const ok = await reminders.schedule(hour, 0, copy.title, copy.body).catch(() => false);
    if (!ok) {
      Alert.alert('Notifications are off', 'Allow notifications for DriveReady in your phone settings to get study reminders.', [
        {text: 'Not now', style: 'cancel'},
        {text: 'Open settings', onPress: () => Linking.openSettings()},
      ]);
    }
    s.update({reminder: {enabled: ok, hour, minute: 0}});
  };

  const changeLanguage = (language: Lang) => {
    s.update({language});
    if (s.reminder.enabled) {
      // Re-schedule so the reminder text follows the new language.
      const copy = reminderCopy(s.state);
      reminders.schedule(s.reminder.hour, s.reminder.minute, copy.title, copy.body).catch(() => false);
    }
  };

  const confirmReset = () =>
    Alert.alert('Reset all progress?', 'This erases your answers, mistakes, saved questions, exam history, streaks and achievements on this device. It cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Are you sure?', 'All study progress will be permanently deleted.', [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Delete everything', style: 'destructive', onPress: () => resetProgress()},
          ]),
      },
    ]);

  return (
    <Screen>
      <SectionHeader title="Your test" style={{marginTop: 0}} />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        <ListRow title="State" value={stateName(s.state)} icon="map-pin" iconColor={hueAt(colors, 0)} onPress={() => navigation.navigate('PickState', {mode: 'change'})} />
        <Divider />
        <ListRow title="License type" value={getTrack(s.track).short} icon={getTrack(s.track).icon} iconColor={hueAt(colors, 3)} onPress={() => navigation.navigate('PickTrack', {mode: 'change'})} />
        <Divider />
        <ListRow
          title="Goals & test date"
          value={s.examDate ? shortDate(parseDayKey(s.examDate)) : `${s.dailyGoal}/day`}
          icon="calendar"
          iconColor={hueAt(colors, 1)}
          onPress={() => navigation.navigate('Goal', {mode: 'change'})}
        />
      </Card>

      <SectionHeader title="Study" />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        <ToggleRow title="Shuffle answer choices" subtitle="Stops you memorizing positions" icon="shuffle" value={s.shuffleChoices} onValueChange={v => s.update({shuffleChoices: v})} />
        <Divider />
        <ToggleRow title="Auto-advance" subtitle="Go to the next question after a correct answer" icon="arrow-right" value={s.autoAdvance} onValueChange={v => s.update({autoAdvance: v})} />
        <Divider />
        <ToggleRow title="Exam timer" subtitle="Count down when your state's test is timed" icon="timer" value={s.examTimer} onValueChange={v => s.update({examTimer: v})} />
        <Divider />
        <ToggleRow title="Realistic exam ending" subtitle="Stop the exam once you've passed or failed" icon="flag" value={s.realisticExam} onValueChange={v => s.update({realisticExam: v})} />
        {reminders.isSupported ? (
          <>
            <Divider />
            <ToggleRow title="Daily study reminder" subtitle={s.reminder.enabled ? `Every day at ${hourLabel(s.reminder.hour)}` : 'Off'} icon="bell" value={s.reminder.enabled} onValueChange={v => setReminder(v)} />
            {s.reminder.enabled ? (
              <View style={[styles.wrap, {gap: spacing.sm, paddingBottom: spacing.md}]}>
                {HOURS.map(h => (
                  <Chip key={h} label={hourLabel(h)} selected={s.reminder.hour === h} onPress={() => setReminder(true, h)} />
                ))}
              </View>
            ) : null}
          </>
        ) : null}
        <Divider />
        <View style={{paddingVertical: spacing.md, gap: spacing.sm}}>
          <Text variant="bodyStrong">Read-aloud speed</Text>
          <SegmentedControl
            options={[
              {label: 'Slower', value: 0.8},
              {label: 'Normal', value: 1},
              {label: 'Faster', value: 1.2},
            ]}
            value={s.speechRate}
            onChange={v => s.update({speechRate: v})}
          />
        </View>
      </Card>

      <SectionHeader title="Appearance" />
      <Card style={{gap: spacing.md}}>
        <Text variant="bodyStrong">Theme</Text>
        <SegmentedControl<ThemeMode>
          options={[
            {label: 'System', value: 'system'},
            {label: 'Light', value: 'light'},
            {label: 'Dark', value: 'dark'},
          ]}
          value={s.theme}
          onChange={v => s.update({theme: v})}
        />
        <Text variant="bodyStrong">Text size</Text>
        <SegmentedControl
          options={[
            {label: 'Default', value: 1},
            {label: 'Large', value: 1.15},
            {label: 'Extra large', value: 1.3},
          ]}
          value={s.textScale}
          onChange={v => s.update({textScale: v})}
        />
        <Text variant="bodyStrong">Language · Idioma</Text>
        <SegmentedControl<Lang> options={LANGUAGES.map(l => ({label: l.label, value: l.id}))} value={s.language} onChange={changeLanguage} />
      </Card>
      <Card padded={false} style={{paddingHorizontal: spacing.lg, marginTop: spacing.md}}>
        <ToggleRow title="Haptic feedback" subtitle="Gentle vibration on answers" icon="hand" value={s.haptics} onValueChange={v => s.update({haptics: v})} />
      </Card>

      <SectionHeader title="Data" />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        <ListRow title="Reset study progress" icon="reset" destructive onPress={confirmReset} chevron={false} />
        <Divider />
        <ListRow
          title="Clear driving log"
          icon="trash"
          destructive
          chevron={false}
          onPress={() =>
            Alert.alert('Clear the driving log?', 'All logged drives will be deleted.', [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Clear', style: 'destructive', onPress: () => resetLog()},
            ])
          }
        />
      </Card>

      <SectionHeader title="About" />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        <ListRow title="About DriveReady" icon="info" iconColor={hueAt(colors, 0)} onPress={() => navigation.navigate('About')} />
        <Divider />
        <ListRow title="Official sources" icon="shield-check" iconColor={hueAt(colors, 1)} onPress={() => navigation.navigate('Sources')} />
        <Divider />
        <ListRow title="Privacy policy" icon="lock" iconColor={hueAt(colors, 5)} onPress={() => navigation.navigate('Privacy')} />
        <Divider />
        <ListRow title="Rate the app" icon="star" iconColor={hueAt(colors, 2)} onPress={() => Linking.openURL(PLAY_STORE_URL).catch(() => undefined)} />
        <Divider />
        <ListRow
          title="Send feedback"
          subtitle={SUPPORT_EMAIL}
          icon="mail"
          iconColor={hueAt(colors, 3)}
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('DriveReady feedback')}`).catch(() => Alert.alert('Email us', SUPPORT_EMAIL))}
        />
      </Card>
      <Text variant="caption" color="textFaint" align="center" style={{marginTop: spacing.lg}}>
        DriveReady {APP_VERSION} · Every feature free, forever
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {flexDirection: 'row', flexWrap: 'wrap'},
});
