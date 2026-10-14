import React, {useMemo} from 'react';
import {Alert, FlatList, Share, StyleSheet, View} from 'react-native';
import {Button, Card, Chip, EmptyState, Icon, ProgressRing, Screen, Text} from '../../components';
import {parseDayKey} from '../../engine/dates';
import {useLearner} from '../../hooks/useLearner';
import {defineStrings, formatDate, tr, useStrings} from '../../i18n';
import type {RootScreenProps} from '../../navigation/types';
import {DriveEntry, driveConditionLabel, driveLogCsv, driveTotals, requirementFromFact, useDriveLog} from '../../store/driveLog';
import {useTheme} from '../../theme/ThemeProvider';
import {shortDate} from '../practice/shared/format';

const STR = defineStrings(
  {
    hm: (h: number, m: number) => (h ? `${h}h ${m ? `${m}m` : ''}`.trim() : `${m}m`),
    shareTitle: 'Supervised driving log',
    shareMessage: (hours: string, night: string, csv: string) => `Supervised driving log — ${hours} hours total, ${night} at night\n\n${csv}`,
    total: 'Total',
    night: 'Night',
    requires: (state: string, value: string) => `${state} requires: ${value}.`,
    goalSet: (goal: number, night: number) => `Goal set to ${goal} hours (${night} at night). Check your state's requirement.`,
    drivesLogged: (n: number) => `${n} drive${n === 1 ? '' : 's'} logged.`,
    logDrive: 'Log a drive',
    export: 'Export',
    officialForm: 'Your state may require its own official log form or signatures — keep those too.',
    emptyTitle: 'No drives yet',
    emptyMessage: 'Log each supervised practice drive to track your hours toward your license.',
    ringA11y: (label: string, value: string, goal: number) => `${label}: ${value} of ${goal} hours`,
    ofGoal: (goal: number) => `of ${goal} h`,
    deleteTitle: 'Delete this drive?',
    cancel: 'Cancel',
    delete: 'Delete',
    rowA11y: (date: string, time: string) => `Drive on ${date}, ${time}`,
    rowHint: 'Opens the drive. Long press to delete.',
    atNight: (time: string) => `${time} at night · `,
    withSupervisor: (name: string) => `with ${name}`,
    noSupervisor: 'Supervisor not set',
  },
  {
    hm: (h: number, m: number) => (h ? `${h} h ${m ? `${m} min` : ''}`.trim() : `${m} min`),
    shareTitle: 'Registro de manejo supervisado',
    shareMessage: (hours: string, night: string, csv: string) => `Registro de manejo supervisado — ${hours} horas en total, ${night} de noche\n\n${csv}`,
    total: 'Total',
    night: 'Noche',
    requires: (state: string, value: string) => `Requisito de ${state}: ${value}.`,
    goalSet: (goal: number, night: number) => `Meta fijada en ${goal} horas (${night} de noche). Confirma el requisito de tu estado.`,
    drivesLogged: (n: number) => (n === 1 ? '1 práctica registrada.' : `${n} prácticas registradas.`),
    logDrive: 'Registrar práctica',
    export: 'Exportar',
    officialForm: 'Tu estado puede exigir su propio formulario oficial o firmas; consérvalos también.',
    emptyTitle: 'Aún no hay prácticas',
    emptyMessage: 'Registra cada práctica de manejo supervisada y lleva la cuenta de las horas que necesitas para tu licencia.',
    ringA11y: (label: string, value: string, goal: number) => `${label}: ${value} de ${goal} horas`,
    ofGoal: (goal: number) => `de ${goal} h`,
    deleteTitle: '¿Eliminar esta práctica?',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    rowA11y: (date: string, time: string) => `Práctica del ${formatDate(parseDayKey(date))}, ${time}`,
    rowHint: 'Abre la práctica. Mantén presionado para eliminarla.',
    atNight: (time: string) => `${time} de noche · `,
    withSupervisor: (name: string) => `con ${name}`,
    noSupervisor: 'Sin supervisor',
  },
);

const hm = (minutes: number) => tr(STR).hm(Math.floor(minutes / 60), minutes % 60);

export function DriveLogScreen({navigation}: RootScreenProps<'DriveLog'>) {
  const {colors, spacing} = useTheme();
  const {stateInfo} = useLearner();
  const entries = useDriveLog(s => s.entries);
  const requiredHours = useDriveLog(s => s.requiredHours);
  const requiredNightHours = useDriveLog(s => s.requiredNightHours);
  const fact = stateInfo.facts.find(f => f.key === 'supervised_driving_hours');
  const fromState = useMemo(() => requirementFromFact(fact), [fact]);
  const goal = requiredHours ?? fromState.hours ?? 50;
  const nightGoal = requiredNightHours ?? fromState.nightHours ?? 10;
  const totals = useMemo(() => driveTotals(entries), [entries]);
  const t = useStrings(STR);

  const exportLog = () => {
    if (!entries.length) {
      return;
    }
    Share.share({
      title: t.shareTitle,
      message: t.shareMessage((totals.minutes / 60).toFixed(1), (totals.nightMinutes / 60).toFixed(1), driveLogCsv(entries)),
    });
  };

  const header = (
    <View style={{gap: spacing.md, marginBottom: spacing.sm}}>
      <Card>
        <View style={[styles.row, styles.around]}>
          <Ring label={t.total} value={totals.minutes / 60} goal={goal} color={colors.primary} />
          <Ring label={t.night} value={totals.nightMinutes / 60} goal={nightGoal} color={colors.accent} />
        </View>
        <Text variant="caption" color="textMuted" align="center" style={{marginTop: spacing.md}}>
          {fact ? t.requires(stateInfo.name, fact.value) : t.goalSet(goal, nightGoal)} {t.drivesLogged(totals.drives)}
        </Text>
      </Card>
      <View style={[styles.row, {gap: spacing.md}]}>
        <Button title={t.logDrive} icon="plus" onPress={() => navigation.navigate('DriveEntry', {})} style={styles.flex} testID="drivelog-add" />
        <Button title={t.export} icon="share" variant="outline" onPress={exportLog} disabled={!entries.length} />
      </View>
      <Text variant="caption" color="textFaint">
        {t.officialForm}
      </Text>
    </View>
  );

  return (
    <Screen scroll={false} padded={false}>
      <FlatList
        data={entries}
        keyExtractor={e => e.id}
        ListHeaderComponent={header}
        contentContainerStyle={{padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.huge}}
        ListEmptyComponent={<EmptyState icon="car-front" title={t.emptyTitle} message={t.emptyMessage} />}
        renderItem={({item}) => <DriveRow entry={item} onPress={() => navigation.navigate('DriveEntry', {id: item.id})} />}
      />
    </Screen>
  );
}

function Ring({label, value, goal, color}: {label: string; value: number; goal: number; color: string}) {
  const {spacing} = useTheme();
  const t = useStrings(STR);
  return (
    <View style={styles.center}>
      <ProgressRing value={goal ? value / goal : 0} size={120} stroke={10} color={color} accessibilityLabel={t.ringA11y(label, value.toFixed(1), goal)}>
        <Text variant="heading">{value.toFixed(1)}</Text>
        <Text variant="caption" color="textMuted">
          {t.ofGoal(goal)}
        </Text>
      </ProgressRing>
      <Text variant="captionStrong" color="textMuted" style={{marginTop: spacing.sm}}>
        {label}
      </Text>
    </View>
  );
}

function DriveRow({entry, onPress}: {entry: DriveEntry; onPress: () => void}) {
  const {colors, spacing} = useTheme();
  const remove = useDriveLog(s => s.remove);
  const t = useStrings(STR);
  return (
    <Card
      onPress={onPress}
      onLongPress={() =>
        Alert.alert(t.deleteTitle, undefined, [
          {text: t.cancel, style: 'cancel'},
          {text: t.delete, style: 'destructive', onPress: () => remove(entry.id)},
        ])
      }
      accessibilityLabel={t.rowA11y(entry.date, hm(entry.minutes))}
      accessibilityHint={t.rowHint}>
      <View style={[styles.row, {gap: spacing.md}]}>
        <Icon name="car-front" color={colors.primary} />
        <View style={styles.flex}>
          <Text variant="bodyStrong">
            {shortDate(parseDayKey(entry.date))} · {hm(entry.minutes)}
          </Text>
          <Text variant="caption" color="textMuted">
            {entry.nightMinutes ? t.atNight(hm(entry.nightMinutes)) : ''}
            {entry.supervisor ? t.withSupervisor(entry.supervisor) : t.noSupervisor}
          </Text>
        </View>
        <Icon name="chevron-right" color="textFaint" />
      </View>
      {entry.conditions.length ? (
        <View style={[styles.wrap, {gap: spacing.xs, marginTop: spacing.sm}]}>
          {entry.conditions.map(c => (
            <Chip key={c} label={driveConditionLabel(c)} />
          ))}
        </View>
      ) : null}
      {entry.notes ? (
        <Text variant="caption" color="textMuted" style={{marginTop: spacing.sm}} numberOfLines={2}>
          {entry.notes}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  around: {justifyContent: 'space-around'},
  center: {alignItems: 'center'},
  wrap: {flexDirection: 'row', flexWrap: 'wrap'},
});
