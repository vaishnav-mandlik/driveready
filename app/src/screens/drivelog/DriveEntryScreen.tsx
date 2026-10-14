import React, {useLayoutEffect, useState} from 'react';
import {Alert, StyleSheet, TextInput, View} from 'react-native';
import {Button, Card, Chip, IconButton, Screen, SectionHeader, Text} from '../../components';
import {addDays, dayKey, daysUntil, parseDayKey} from '../../engine/dates';
import {defineStrings, useStrings} from '../../i18n';
import type {RootScreenProps} from '../../navigation/types';
import {DRIVE_CONDITIONS, driveConditionLabel, useDriveLog} from '../../store/driveLog';
import {useTheme} from '../../theme/ThemeProvider';
import {longDate} from '../practice/shared/format';

const STR = defineStrings(
  {
    decrease: (label: string) => `Decrease ${label}`,
    increase: (label: string) => `Increase ${label}`,
    duration: (h: number, mm: string) => `${h}h ${mm}m`,
    editTitle: 'Edit Drive',
    newTitle: 'Log a Drive',
    delete: 'Delete',
    deleteTitle: 'Delete this drive?',
    cancel: 'Cancel',
    save: 'Save drive',
    when: 'When',
    previousDay: 'Previous day',
    nextDay: 'Next day',
    today: 'Today',
    yesterday: 'Yesterday',
    howLong: 'How long',
    totalTime: 'Total time',
    atNight: 'At night',
    conditions: 'Conditions',
    supervisor: 'Supervising driver',
    supervisorPlaceholder: 'Name or initials',
    notes: 'Notes',
    notesPlaceholder: 'What did you practice? (parallel parking, merging...)',
  },
  {
    decrease: (label: string) => `Reducir ${label.toLowerCase()}`,
    increase: (label: string) => `Aumentar ${label.toLowerCase()}`,
    duration: (h: number, mm: string) => `${h} h ${mm} min`,
    editTitle: 'Editar práctica',
    newTitle: 'Registrar práctica',
    delete: 'Eliminar',
    deleteTitle: '¿Eliminar esta práctica?',
    cancel: 'Cancelar',
    save: 'Guardar práctica',
    when: 'Cuándo',
    previousDay: 'Día anterior',
    nextDay: 'Día siguiente',
    today: 'Hoy',
    yesterday: 'Ayer',
    howLong: 'Duración',
    totalTime: 'Tiempo total',
    atNight: 'Tiempo de noche',
    conditions: 'Condiciones',
    supervisor: 'Conductor supervisor',
    supervisorPlaceholder: 'Nombre o iniciales',
    notes: 'Notas',
    notesPlaceholder: '¿Qué practicaste? (estacionar en paralelo, incorporarte al tráfico...)',
  },
);

function Stepper({label, value, step, min, max, onChange, format}: {label: string; value: number; step: number; min: number; max: number; onChange: (v: number) => void; format: (v: number) => string}) {
  const {colors, spacing} = useTheme();
  const t = useStrings(STR);
  return (
    <View style={[styles.row, {gap: spacing.sm}]}>
      <Text variant="body" style={styles.flex}>
        {label}
      </Text>
      <IconButton icon="minus" accessibilityLabel={t.decrease(label)} onPress={() => onChange(Math.max(min, value - step))} disabled={value <= min} background={colors.surfaceAlt} />
      <Text variant="bodyStrong" style={styles.value} align="center" accessibilityLiveRegion="polite">
        {format(value)}
      </Text>
      <IconButton icon="plus" accessibilityLabel={t.increase(label)} onPress={() => onChange(Math.min(max, value + step))} disabled={value >= max} background={colors.surfaceAlt} />
    </View>
  );
}

export function DriveEntryScreen({navigation, route}: RootScreenProps<'DriveEntry'>) {
  const {colors, spacing, radius, textScale} = useTheme();
  const t = useStrings(STR);
  const fmt = (m: number) => t.duration(Math.floor(m / 60), String(m % 60).padStart(2, '0'));
  const id = route.params?.id;
  const existing = useDriveLog(s => (id ? s.entries.find(e => e.id === id) : undefined));
  const add = useDriveLog(s => s.add);
  const update = useDriveLog(s => s.update);
  const remove = useDriveLog(s => s.remove);

  const [date, setDate] = useState(existing?.date ?? dayKey());
  const [minutes, setMinutes] = useState(existing?.minutes ?? 30);
  const [nightMinutes, setNightMinutes] = useState(existing?.nightMinutes ?? 0);
  const [conditions, setConditions] = useState<string[]>(existing?.conditions ?? []);
  const [supervisor, setSupervisor] = useState(existing?.supervisor ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  useLayoutEffect(() => {
    navigation.setOptions({title: existing ? t.editTitle : t.newTitle});
  }, [navigation, existing, t]);

  const shiftDate = (days: number) => {
    const next = dayKey(addDays(parseDayKey(date), days));
    if (daysUntil(next) <= 0) {
      setDate(next);
    }
  };

  const save = () => {
    const entry = {date, minutes, nightMinutes: Math.min(nightMinutes, minutes), conditions, supervisor: supervisor.trim(), notes: notes.trim()};
    if (existing) {
      update(existing.id, entry);
    } else {
      add(entry);
    }
    navigation.goBack();
  };

  const inputStyle = [styles.input, {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, color: colors.text, fontSize: 16 * textScale, paddingHorizontal: spacing.md}];

  return (
    <Screen
      footer={
        <View style={[styles.row, {gap: spacing.md}]}>
          {existing ? (
            <Button
              title={t.delete}
              variant="outline"
              icon="trash"
              onPress={() =>
                Alert.alert(t.deleteTitle, undefined, [
                  {text: t.cancel, style: 'cancel'},
                  {
                    text: t.delete,
                    style: 'destructive',
                    onPress: () => {
                      remove(existing.id);
                      navigation.goBack();
                    },
                  },
                ])
              }
            />
          ) : null}
          <Button title={t.save} icon="check" onPress={save} disabled={minutes <= 0} style={styles.flex} testID="drive-save" />
        </View>
      }>
      <SectionHeader title={t.when} style={{marginTop: 0}} />
      <Card>
        <View style={[styles.row, {gap: spacing.sm}]}>
          <IconButton icon="chevron-left" accessibilityLabel={t.previousDay} onPress={() => shiftDate(-1)} background={colors.surfaceAlt} />
          <Text variant="bodyStrong" align="center" style={styles.flex}>
            {longDate(parseDayKey(date))}
          </Text>
          <IconButton icon="chevron-right" accessibilityLabel={t.nextDay} onPress={() => shiftDate(1)} disabled={daysUntil(date) >= 0} background={colors.surfaceAlt} />
        </View>
        <View style={[styles.wrap, {gap: spacing.sm, marginTop: spacing.md}]}>
          <Chip label={t.today} selected={date === dayKey()} onPress={() => setDate(dayKey())} />
          <Chip label={t.yesterday} selected={date === dayKey(addDays(new Date(), -1))} onPress={() => setDate(dayKey(addDays(new Date(), -1)))} />
        </View>
      </Card>

      <SectionHeader title={t.howLong} />
      <Card style={{gap: spacing.md}}>
        <Stepper label={t.totalTime} value={minutes} step={15} min={0} max={12 * 60} onChange={setMinutes} format={fmt} />
        <Stepper label={t.atNight} value={Math.min(nightMinutes, minutes)} step={15} min={0} max={minutes} onChange={setNightMinutes} format={fmt} />
      </Card>

      <SectionHeader title={t.conditions} />
      <View style={[styles.wrap, {gap: spacing.sm}]}>
        {DRIVE_CONDITIONS.map(c => (
          <Chip key={c} label={driveConditionLabel(c)} selected={conditions.includes(c)} onPress={() => setConditions(cs => (cs.includes(c) ? cs.filter(x => x !== c) : [...cs, c]))} />
        ))}
      </View>

      <SectionHeader title={t.supervisor} />
      <TextInput value={supervisor} onChangeText={setSupervisor} placeholder={t.supervisorPlaceholder} placeholderTextColor={colors.textFaint} maxLength={40} accessibilityLabel={t.supervisor} style={inputStyle} />

      <SectionHeader title={t.notes} />
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder={t.notesPlaceholder}
        placeholderTextColor={colors.textFaint}
        multiline
        maxLength={300}
        accessibilityLabel={t.notes}
        style={[inputStyle, styles.notes]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  wrap: {flexDirection: 'row', flexWrap: 'wrap'},
  value: {minWidth: 70},
  input: {borderWidth: 1, minHeight: 50},
  notes: {minHeight: 100, textAlignVertical: 'top', paddingTop: 12},
});
