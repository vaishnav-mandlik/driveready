import React, {useMemo} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Card, IconTile, ProgressBar, Screen, Text} from '../../components';
import {getBank} from '../../data/bank';
import {getExamConfig} from '../../data/exams';
import {ACHIEVEMENTS, AchievementContext} from '../../engine/achievements';
import {computeReadiness} from '../../engine/readiness';
import {useLearner} from '../../hooks/useLearner';
import type {RootScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {useSettings} from '../../store/settings';
import {useTheme} from '../../theme/ThemeProvider';
import {TIER_COLORS} from './ProgressScreen';

export function AchievementsScreen(_props: RootScreenProps<'Achievements'>) {
  const {colors, spacing} = useTheme();
  const {track, state} = useLearner();
  const p = useProgress();
  const dailyGoal = useSettings(s => s.dailyGoal);

  const ctx = useMemo<AchievementContext>(() => {
    const bank = getBank(track, state);
    return {
      stats: p.stats,
      exams: p.exams,
      days: p.days,
      signLevels: p.signLevels,
      lessonsRead: p.lessonsRead,
      clearedMistakes: p.clearedMistakes,
      totalAnswered: p.totalAnswered,
      marathonsFinished: p.marathonsFinished,
      dailyGoal,
      bank,
      passProbability: computeReadiness(bank, p.stats, getExamConfig(track, state)).passProbability,
      now: Date.now(),
    };
  }, [p, track, state, dailyGoal]);

  const unlockedCount = ACHIEVEMENTS.filter(a => p.achievements[a.id]).length;

  return (
    <Screen scroll={false} padded={false}>
      <FlatList
        data={ACHIEVEMENTS}
        keyExtractor={a => a.id}
        numColumns={2}
        columnWrapperStyle={{gap: spacing.md}}
        contentContainerStyle={{padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.huge}}
        ListHeaderComponent={
          <Text variant="body" color="textMuted" style={{marginBottom: spacing.sm}}>
            {unlockedCount} of {ACHIEVEMENTS.length} unlocked. Keep studying to collect them all!
          </Text>
        }
        renderItem={({item}) => {
          const at = p.achievements[item.id];
          const progress = at ? 1 : item.progress?.(ctx) ?? 0;
          const color = TIER_COLORS[item.tier];
          return (
            <Card style={[styles.cell, !at && styles.locked]} accessibilityLabel={`${item.title}. ${item.description}. ${at ? 'Unlocked' : 'Locked'}`}>
              <IconTile name={at ? item.icon : 'lock'} color={at ? color : colors.textFaint} size={48} />
              <Text variant="bodyStrong" style={{marginTop: spacing.sm}}>
                {item.title}
              </Text>
              <Text variant="caption" color="textMuted" style={styles.desc}>
                {item.description}
              </Text>
              <View style={{marginTop: spacing.sm}}>
                {at ? (
                  <Text variant="captionStrong" color={color}>
                    {item.tier.toUpperCase()} · {new Date(at).toLocaleDateString()}
                  </Text>
                ) : item.progress ? (
                  <ProgressBar value={progress} height={5} color={color} accessibilityLabel={`${Math.round(progress * 100)} percent`} />
                ) : (
                  <Text variant="caption" color="textFaint">
                    {item.tier}
                  </Text>
                )}
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cell: {flex: 1},
  locked: {opacity: 0.75},
  desc: {marginTop: 2, minHeight: 34},
});
