import React, {useMemo, useRef, useState} from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import {Button, Chip, EmptyState, Icon, IconTile, ProgressBar, Screen, Text} from '../../components';
import {FACT_GROUPS, factLabel} from '../../data/factMeta';
import type {StateFact} from '../../data/types';
import {createRng, randomSeed, shuffle} from '../../engine/random';
import {useLearner} from '../../hooks/useLearner';
import {haptic, speech} from '../../native';
import type {RootScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {hueAt, useTheme} from '../../theme/ThemeProvider';

/** Flashcards of the state's verified facts: front = the rule, back = the number + explanation. */
export function FactCardsScreen({navigation}: RootScreenProps<'FactCards'>) {
  const {colors, spacing, radius} = useTheme();
  const {stateInfo} = useLearner();
  // Reuses the generic per-item "known" levels map (shared with sign flashcards) with a namespaced key.
  const levels = useProgress(s => s.signLevels);
  const setLevel = useProgress(s => s.setSignLevel);
  const keyOf = (f: StateFact) => `fact:${stateInfo.code}:${f.key}`;
  const [onlyLearning, setOnlyLearning] = useState(false);
  const [seed, setSeed] = useState(() => randomSeed());

  const groupIndex = useMemo(() => new Map(FACT_GROUPS.flatMap((g, i) => g.keys.map(k => [k.key, i] as const))), []);
  const deck = useMemo(() => {
    const base = onlyLearning ? stateInfo.facts.filter(f => (levels[keyOf(f)] ?? 0) < 2) : stateInfo.facts;
    return shuffle(base, createRng(seed));
    // levels intentionally excluded: rating a card must not reshuffle mid-deck
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateInfo, onlyLearning, seed]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [gotIt, setGotIt] = useState(0);
  const flip = useRef(new Animated.Value(0)).current;

  const restart = (learning: boolean) => {
    setOnlyLearning(learning);
    setSeed(randomSeed());
    setIndex(0);
    setGotIt(0);
    setFlipped(false);
    flip.setValue(0);
  };

  const toggle = () => {
    haptic('selection');
    Animated.spring(flip, {toValue: flipped ? 0 : 1, friction: 7, tension: 60, useNativeDriver: true}).start();
    setFlipped(f => !f);
  };

  const rate = (known: boolean) => {
    const card = deck[index];
    if (!card) {
      return;
    }
    haptic(known ? 'success' : 'tap');
    setLevel(keyOf(card), known ? 2 : 0);
    if (known) {
      setGotIt(g => g + 1);
    }
    flip.setValue(0);
    setFlipped(false);
    setIndex(i => i + 1);
  };

  if (!stateInfo.facts.length) {
    return (
      <Screen>
        <EmptyState icon="file" title="Coming soon" message={`Verified ${stateInfo.name} facts are being prepared.`} actionLabel="Go back" onAction={() => navigation.goBack()} />
      </Screen>
    );
  }
  if (!deck.length) {
    return (
      <Screen>
        <EmptyState icon="badge-check" title="You know them all!" message="Every fact is marked as known." actionLabel="Review all again" onAction={() => restart(false)} />
      </Screen>
    );
  }
  if (index >= deck.length) {
    return (
      <Screen>
        <EmptyState icon="party" title="Deck complete!" message={`You knew ${gotIt} of ${deck.length}.`} />
        <View style={{gap: spacing.md}}>
          {gotIt < deck.length ? <Button title="Practice the ones I missed" icon="repeat" onPress={() => restart(true)} fullWidth /> : null}
          <Button title="Shuffle and restart" variant="outline" icon="shuffle" onPress={() => restart(false)} fullWidth />
          <Button title={`Quiz me on ${stateInfo.name} laws`} variant="ghost" icon="target" onPress={() => navigation.replace('Quiz', {spec: {mode: 'state', title: `${stateInfo.name} Laws`}})} fullWidth />
        </View>
      </Screen>
    );
  }

  const card = deck[index];
  const gi = groupIndex.get(card.key) ?? 0;
  const group = FACT_GROUPS[gi];
  const front = flip.interpolate({inputRange: [0, 1], outputRange: ['0deg', '180deg']});
  const back = flip.interpolate({inputRange: [0, 1], outputRange: ['180deg', '360deg']});
  const cardStyle = [styles.card, {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.xl}];

  return (
    <Screen
      scroll={false}
      footer={
        <View style={[styles.row, {gap: spacing.md}]}>
          <Button title="Still learning" variant="outline" icon="repeat" onPress={() => rate(false)} style={styles.flex} />
          <Button title="Got it" variant="success" icon="check" onPress={() => rate(true)} style={styles.flex} />
        </View>
      }>
      <View style={[styles.row, {gap: spacing.sm}]}>
        <Text variant="captionStrong" color="textMuted" style={styles.flex}>
          {stateInfo.name} · {index + 1} / {deck.length}
        </Text>
        <Chip label={onlyLearning ? 'Learning only' : 'All cards'} icon="sliders" onPress={() => restart(!onlyLearning)} />
      </View>
      <ProgressBar value={index / deck.length} height={6} style={{marginTop: spacing.sm}} />
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={flipped ? `${factLabel(card.key)}: ${card.value}. ${card.detail}` : `${factLabel(card.key)}. Tap to reveal the answer.`}
        style={[styles.flex, {marginTop: spacing.lg}]}>
        <Animated.View style={[cardStyle, {transform: [{perspective: 1000}, {rotateY: front}]}]}>
          <IconTile name={group?.icon ?? 'file'} color={hueAt(colors, gi)} size={64} />
          <Text variant="label" color="textMuted" style={{marginTop: spacing.lg}}>
            {group?.title}
          </Text>
          <Text variant="title" align="center" style={{marginTop: spacing.sm}}>
            {factLabel(card.key)}?
          </Text>
          <View style={[styles.hint, {gap: spacing.xs}]}>
            <Icon name="repeat" size={16} color="textFaint" />
            <Text variant="caption" color="textFaint">
              Tap to flip
            </Text>
          </View>
        </Animated.View>
        <Animated.View style={[cardStyle, {transform: [{perspective: 1000}, {rotateY: back}]}]}>
          <Text variant="label" color="textMuted">
            {factLabel(card.key)}
          </Text>
          <Text variant="display" color="primary" align="center" style={{marginTop: spacing.sm}}>
            {card.value}
          </Text>
          <Text variant="body" color="textMuted" align="center" style={{marginTop: spacing.md}}>
            {card.detail}
          </Text>
          {card.source.page ? (
            <Text variant="caption" color="textFaint" style={{marginTop: spacing.md}}>
              Handbook p. {card.source.page}
            </Text>
          ) : null}
          <Button title="Hear it" variant="ghost" size="sm" icon="volume" onPress={() => speech.speak(`${factLabel(card.key)}: ${card.value}. ${card.detail}`)} style={{marginTop: spacing.sm}} />
        </Animated.View>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  card: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', borderWidth: 1, backfaceVisibility: 'hidden'},
  hint: {position: 'absolute', bottom: 20, flexDirection: 'row', alignItems: 'center'},
});
