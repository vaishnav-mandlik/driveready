import React, {useState} from 'react';
import {Alert, StyleSheet, TextInput, View} from 'react-native';
import {Button, Card, Chip, Divider, IconButton, Screen, SectionHeader, SegmentedControl, Text, ToggleRow} from '../../components';
import {stateName} from '../../data/states';
import {getTrack} from '../../data/tracks';
import {addDays, dayKey, daysUntil, parseDayKey} from '../../engine/dates';
import {defineStrings, tr, useStrings} from '../../i18n';
import {reminders} from '../../native';
import type {RootScreenProps} from '../../navigation/types';
import {useSettings} from '../../store/settings';
import {useTheme} from '../../theme/ThemeProvider';
import {longDate} from '../practice/shared/format';

const GOALS = [10, 20, 30, 50];
const REMINDER_HOURS = [8, 12, 17, 19, 21];

const STR = defineStrings(
  {
    reminderTitle: 'Time for a quick practice session',
    reminderBody: (state: string) => `A few questions a day is the fastest way to pass your ${state} test.`,
    hours: {8: '8 AM', 12: '12 PM', 17: '5 PM', 19: '7 PM', 21: '9 PM'} as Record<number, string>,
    remindersOffTitle: 'Reminders are off',
    remindersOffBody: 'Notifications are blocked for DriveReady. You can turn them on later in Settings.',
    startStudying: 'Start studying',
    save: 'Save',
    step: 'Step 3 of 3',
    title: 'Set your goal',
    intro: (state: string, track: string) => `${state} · ${track}. Everything here is optional.`,
    testDate: 'Test date',
    in1Week: 'In 1 week',
    in2Weeks: 'In 2 weeks',
    in1Month: 'In 1 month',
    notSure: 'Not sure yet',
    dayEarlier: 'One day earlier',
    dayLater: 'One day later',
    until: (days: number) => (days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`),
    dailyGoal: 'Daily goal',
    pace: (goal: number) =>
      `Questions per day. ${goal <= 10 ? 'A gentle pace.' : goal <= 20 ? 'Recommended for most learners.' : 'Great if your test is soon.'}`,
    studyReminder: 'Study reminder',
    dailyReminder: 'Daily reminder',
    dailyReminderSub: 'A gentle nudge to keep your streak',
    firstName: 'Your first name (optional)',
    namePlaceholder: 'For a friendlier greeting',
    nameLabel: 'First name',
  },
  {
    reminderTitle: 'Hora de practicar un poco',
    reminderBody: (state: string) => `Unas cuantas preguntas al día son la forma más rápida de aprobar tu examen de ${state}.`,
    hours: {8: '8 a. m.', 12: '12 p. m.', 17: '5 p. m.', 19: '7 p. m.', 21: '9 p. m.'} as Record<number, string>,
    remindersOffTitle: 'Recordatorios desactivados',
    remindersOffBody: 'Las notificaciones de DriveReady están bloqueadas. Puedes activarlas más tarde en Ajustes.',
    startStudying: 'Empezar a estudiar',
    save: 'Guardar',
    step: 'Paso 3 de 3',
    title: 'Fija tu meta',
    intro: (state: string, track: string) => `${state} · ${track}. Todo esto es opcional.`,
    testDate: 'Fecha del examen',
    in1Week: 'En 1 semana',
    in2Weeks: 'En 2 semanas',
    in1Month: 'En 1 mes',
    notSure: 'Aún no lo sé',
    dayEarlier: 'Un día antes',
    dayLater: 'Un día después',
    until: (days: number) => (days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : `En ${days} días`),
    dailyGoal: 'Meta diaria',
    pace: (goal: number) =>
      `Preguntas por día. ${goal <= 10 ? 'Un ritmo tranquilo.' : goal <= 20 ? 'Recomendado para la mayoría.' : 'Ideal si tu examen es pronto.'}`,
    studyReminder: 'Recordatorio de estudio',
    dailyReminder: 'Recordatorio diario',
    dailyReminderSub: 'Un empujoncito para mantener tu racha',
    firstName: 'Tu nombre (opcional)',
    namePlaceholder: 'Para un saludo más personal',
    nameLabel: 'Nombre',
  },
);

export function reminderCopy(state: string | null) {
  const t = tr(STR);
  return {
    title: t.reminderTitle,
    body: t.reminderBody(stateName(state as never)),
  };
}

export function GoalScreen({navigation, route}: RootScreenProps<'Goal'>) {
  const {colors, spacing, radius, textScale} = useTheme();
  const t = useStrings(STR);
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
        Alert.alert(t.remindersOffTitle, t.remindersOffBody);
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
          title={mode === 'onboarding' ? t.startStudying : t.save}
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
            {t.step}
          </Text>
          <Text variant="title" accessibilityRole="header">
            {t.title}
          </Text>
          <Text variant="body" color="textMuted">
            {t.intro(stateName(s.state), getTrack(s.track).title)}
          </Text>
        </View>
      ) : null}

      <SectionHeader title={t.testDate} />
      <Card>
        <View style={[styles.wrap, {gap: spacing.sm}]}>
          {[
            {label: t.in1Week, days: 7},
            {label: t.in2Weeks, days: 14},
            {label: t.in1Month, days: 30},
          ].map(o => (
            <Chip
              key={o.label}
              label={o.label}
              selected={until === o.days}
              onPress={() => setExamDate(dayKey(addDays(parseDayKey(dayKey()), o.days)))}
            />
          ))}
          <Chip label={t.notSure} selected={!examDate} onPress={() => setExamDate(null)} />
        </View>
        {examDate ? (
          <View style={[styles.row, {marginTop: spacing.lg, gap: spacing.sm}]}>
            <IconButton icon="minus" accessibilityLabel={t.dayEarlier} onPress={() => shift(-1)} background={colors.surfaceAlt} />
            <View style={styles.flex}>
              <Text variant="bodyStrong" align="center">
                {longDate(parseDayKey(examDate))}
              </Text>
              <Text variant="caption" color="textMuted" align="center">
                {t.until(until ?? 0)}
              </Text>
            </View>
            <IconButton icon="plus" accessibilityLabel={t.dayLater} onPress={() => shift(1)} background={colors.surfaceAlt} />
          </View>
        ) : null}
      </Card>

      <SectionHeader title={t.dailyGoal} />
      <Card>
        <SegmentedControl
          options={GOALS.map(g => ({label: `${g}`, value: g}))}
          value={dailyGoal}
          onChange={setDailyGoal}
        />
        <Text variant="caption" color="textMuted" style={{marginTop: spacing.sm}}>
          {t.pace(dailyGoal)}
        </Text>
      </Card>

      {reminders.isSupported ? (
        <>
          <SectionHeader title={t.studyReminder} />
          <Card padded={false} style={{paddingHorizontal: spacing.lg, paddingBottom: reminderOn ? spacing.lg : 0}}>
            <ToggleRow title={t.dailyReminder} subtitle={t.dailyReminderSub} icon="bell" value={reminderOn} onValueChange={setReminderOn} />
            {reminderOn ? (
              <>
                <Divider />
                <View style={[styles.wrap, {gap: spacing.sm, marginTop: spacing.md}]}>
                  {REMINDER_HOURS.map(h => (
                    <Chip key={h} label={t.hours[h]} selected={hour === h} onPress={() => setHour(h)} />
                  ))}
                </View>
              </>
            ) : null}
          </Card>
        </>
      ) : null}

      <SectionHeader title={t.firstName} />
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t.namePlaceholder}
        placeholderTextColor={colors.textFaint}
        maxLength={30}
        autoCapitalize="words"
        accessibilityLabel={t.nameLabel}
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
