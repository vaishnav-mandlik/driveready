import React, {useMemo} from 'react';
import {Alert, FlatList, Share, StyleSheet, View} from 'react-native';
import {Button, Card, Chip, EmptyState, Icon, ProgressRing, Screen, Text} from '../../components';
import {parseDayKey} from '../../engine/dates';
import {useLearner} from '../../hooks/useLearner';
import type {RootScreenProps} from '../../navigation/types';
import {DriveEntry, driveLogCsv, driveTotals, requirementFromFact, useDriveLog} from '../../store/driveLog';
import {useTheme} from '../../theme/ThemeProvider';
import {shortDate} from '../practice/shared/format';

const hm = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m ? `${m}m` : ''}`.trim() : `${m}m`;
};

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

  const exportLog = () => {
    if (!entries.length) {
      return;
    }
    Share.share({
      title: 'Supervised driving log',
      message: `Supervised driving log — ${(totals.minutes / 60).toFixed(1)} hours total, ${(totals.nightMinutes / 60).toFixed(1)} at night\n\n${driveLogCsv(entries)}`,
    });
  };

  const header = (
    <View style={{gap: spacing.md, marginBottom: spacing.sm}}>
      <Card>
        <View style={[styles.row, styles.around]}>
          <Ring label="Total" value={totals.minutes / 60} goal={goal} color={colors.primary} />
          <Ring label="Night" value={totals.nightMinutes / 60} goal={nightGoal} color={colors.accent} />
        </View>
        <Text variant="caption" color="textMuted" align="center" style={{marginTop: spacing.md}}>
          {fact
            ? `${stateInfo.name} requires: ${fact.value}.`
            : `Goal set to ${goal} hours (${nightGoal} at night). Check your state's requirement.`}{' '}
          {totals.drives} drive{totals.drives === 1 ? '' : 's'} logged.
        </Text>
      </Card>
      <View style={[styles.row, {gap: spacing.md}]}>
        <Button title="Log a drive" icon="plus" onPress={() => navigation.navigate('DriveEntry', {})} style={styles.flex} testID="drivelog-add" />
        <Button title="Export" icon="share" variant="outline" onPress={exportLog} disabled={!entries.length} />
      </View>
      <Text variant="caption" color="textFaint">
        Your state may require its own official log form or signatures — keep those too.
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
        ListEmptyComponent={<EmptyState icon="car-front" title="No drives yet" message="Log each supervised practice drive to track your hours toward your license." />}
        renderItem={({item}) => <DriveRow entry={item} onPress={() => navigation.navigate('DriveEntry', {id: item.id})} />}
      />
    </Screen>
  );
}

function Ring({label, value, goal, color}: {label: string; value: number; goal: number; color: string}) {
  const {spacing} = useTheme();
  return (
    <View style={styles.center}>
      <ProgressRing value={goal ? value / goal : 0} size={120} stroke={10} color={color} accessibilityLabel={`${label}: ${value.toFixed(1)} of ${goal} hours`}>
        <Text variant="heading">{value.toFixed(1)}</Text>
        <Text variant="caption" color="textMuted">
          of {goal} h
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
  return (
    <Card
      onPress={onPress}
      onLongPress={() =>
        Alert.alert('Delete this drive?', undefined, [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Delete', style: 'destructive', onPress: () => remove(entry.id)},
        ])
      }
      accessibilityLabel={`Drive on ${entry.date}, ${hm(entry.minutes)}`}
      accessibilityHint="Opens the drive. Long press to delete.">
      <View style={[styles.row, {gap: spacing.md}]}>
        <Icon name="car-front" color={colors.primary} />
        <View style={styles.flex}>
          <Text variant="bodyStrong">
            {shortDate(parseDayKey(entry.date))} · {hm(entry.minutes)}
          </Text>
          <Text variant="caption" color="textMuted">
            {entry.nightMinutes ? `${hm(entry.nightMinutes)} at night · ` : ''}
            {entry.supervisor ? `with ${entry.supervisor}` : 'Supervisor not set'}
          </Text>
        </View>
        <Icon name="chevron-right" color="textFaint" />
      </View>
      {entry.conditions.length ? (
        <View style={[styles.wrap, {gap: spacing.xs, marginTop: spacing.sm}]}>
          {entry.conditions.map(c => (
            <Chip key={c} label={c} />
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
