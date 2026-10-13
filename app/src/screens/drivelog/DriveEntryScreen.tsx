import React, {useLayoutEffect, useState} from 'react';
import {Alert, StyleSheet, TextInput, View} from 'react-native';
import {Button, Card, Chip, IconButton, Screen, SectionHeader, Text} from '../../components';
import {addDays, dayKey, daysUntil, parseDayKey} from '../../engine/dates';
import type {RootScreenProps} from '../../navigation/types';
import {DRIVE_CONDITIONS, useDriveLog} from '../../store/driveLog';
import {useTheme} from '../../theme/ThemeProvider';
import {longDate} from '../practice/shared/format';

function Stepper({label, value, step, min, max, onChange, format}: {label: string; value: number; step: number; min: number; max: number; onChange: (v: number) => void; format: (v: number) => string}) {
  const {colors, spacing} = useTheme();
  return (
    <View style={[styles.row, {gap: spacing.sm}]}>
      <Text variant="body" style={styles.flex}>
        {label}
      </Text>
      <IconButton icon="minus" accessibilityLabel={`Decrease ${label}`} onPress={() => onChange(Math.max(min, value - step))} disabled={value <= min} background={colors.surfaceAlt} />
      <Text variant="bodyStrong" style={styles.value} align="center" accessibilityLiveRegion="polite">
        {format(value)}
      </Text>
      <IconButton icon="plus" accessibilityLabel={`Increase ${label}`} onPress={() => onChange(Math.min(max, value + step))} disabled={value >= max} background={colors.surfaceAlt} />
    </View>
  );
}

const fmt = (m: number) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;

export function DriveEntryScreen({navigation, route}: RootScreenProps<'DriveEntry'>) {
  const {colors, spacing, radius, textScale} = useTheme();
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
    navigation.setOptions({title: existing ? 'Edit Drive' : 'Log a Drive'});
  }, [navigation, existing]);

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
              title="Delete"
              variant="outline"
              icon="trash"
              onPress={() =>
                Alert.alert('Delete this drive?', undefined, [
                  {text: 'Cancel', style: 'cancel'},
                  {
                    text: 'Delete',
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
          <Button title="Save drive" icon="check" onPress={save} disabled={minutes <= 0} style={styles.flex} testID="drive-save" />
        </View>
      }>
      <SectionHeader title="When" style={{marginTop: 0}} />
      <Card>
        <View style={[styles.row, {gap: spacing.sm}]}>
          <IconButton icon="chevron-left" accessibilityLabel="Previous day" onPress={() => shiftDate(-1)} background={colors.surfaceAlt} />
          <Text variant="bodyStrong" align="center" style={styles.flex}>
            {longDate(parseDayKey(date))}
          </Text>
          <IconButton icon="chevron-right" accessibilityLabel="Next day" onPress={() => shiftDate(1)} disabled={daysUntil(date) >= 0} background={colors.surfaceAlt} />
        </View>
        <View style={[styles.wrap, {gap: spacing.sm, marginTop: spacing.md}]}>
          <Chip label="Today" selected={date === dayKey()} onPress={() => setDate(dayKey())} />
          <Chip label="Yesterday" selected={date === dayKey(addDays(new Date(), -1))} onPress={() => setDate(dayKey(addDays(new Date(), -1)))} />
        </View>
      </Card>

      <SectionHeader title="How long" />
      <Card style={{gap: spacing.md}}>
        <Stepper label="Total time" value={minutes} step={15} min={0} max={12 * 60} onChange={setMinutes} format={fmt} />
        <Stepper label="At night" value={Math.min(nightMinutes, minutes)} step={15} min={0} max={minutes} onChange={setNightMinutes} format={fmt} />
      </Card>

      <SectionHeader title="Conditions" />
      <View style={[styles.wrap, {gap: spacing.sm}]}>
        {DRIVE_CONDITIONS.map(c => (
          <Chip key={c} label={c} selected={conditions.includes(c)} onPress={() => setConditions(cs => (cs.includes(c) ? cs.filter(x => x !== c) : [...cs, c]))} />
        ))}
      </View>

      <SectionHeader title="Supervising driver" />
      <TextInput value={supervisor} onChangeText={setSupervisor} placeholder="Name or initials" placeholderTextColor={colors.textFaint} maxLength={40} accessibilityLabel="Supervising driver" style={inputStyle} />

      <SectionHeader title="Notes" />
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="What did you practice? (parallel parking, merging...)"
        placeholderTextColor={colors.textFaint}
        multiline
        maxLength={300}
        accessibilityLabel="Notes"
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
