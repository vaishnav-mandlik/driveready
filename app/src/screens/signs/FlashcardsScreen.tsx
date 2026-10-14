import React, {useMemo, useRef, useState} from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import {Button, Chip, EmptyState, Icon, ProgressBar, Screen, SignImage, Text} from '../../components';
import {signCategories, allSigns} from '../../data/signs';
import type {SignInfo} from '../../data/types';
import {createRng, randomSeed, shuffle} from '../../engine/random';
import {haptic, speech} from '../../native';
import type {RootScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {useTheme} from '../../theme/ThemeProvider';

export function FlashcardsScreen({navigation, route}: RootScreenProps<'Flashcards'>) {
  const {colors, spacing, radius} = useTheme();
  const category = route.params?.category ?? 'all';
  const levels = useProgress(s => s.signLevels);
  const setLevel = useProgress(s => s.setSignLevel);
  const [onlyLearning, setOnlyLearning] = useState(false);
  const [seed, setSeed] = useState(() => randomSeed());

  const deck = useMemo<SignInfo[]>(() => {
    const base = allSigns().filter(s => category === 'all' || s.category === category);
    const filtered = onlyLearning ? base.filter(s => (levels[s.code] ?? 0) < 2) : base;
    return shuffle(filtered, createRng(seed));
    // levels intentionally excluded: rating a card must not reshuffle the deck mid-session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, onlyLearning, seed]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [gotIt, setGotIt] = useState(0);
  const flip = useRef(new Animated.Value(0)).current;

  const restart = (learningOnly: boolean) => {
    setOnlyLearning(learningOnly);
    setSeed(randomSeed());
    setIndex(0);
    setGotIt(0);
    setFlipped(false);
    flip.setValue(0);
  };

  const toggleFlip = () => {
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
    setLevel(card.code, known ? 2 : (levels[card.code] ?? 0) >= 1 ? 1 : 0);
    if (known) {
      setGotIt(g => g + 1);
    }
    flip.setValue(0);
    setFlipped(false);
    setIndex(i => i + 1);
  };

  const categoryTitle = category === 'all' ? 'All signs' : signCategories().find(c => c.id === category)?.title ?? 'Signs';

  if (!deck.length) {
    return (
      <Screen>
        <EmptyState
          icon="badge-check"
          title={onlyLearning ? 'You know them all!' : 'No signs here yet'}
          message={onlyLearning ? 'Every sign in this set is marked as known.' : 'Signs for this category are coming soon.'}
          actionLabel={onlyLearning ? 'Review all signs' : 'Go back'}
          onAction={() => (onlyLearning ? restart(false) : navigation.goBack())}
        />
      </Screen>
    );
  }

  if (index >= deck.length) {
    const pct = Math.round((gotIt / deck.length) * 100);
    return (
      <Screen>
        <EmptyState
          icon="party"
          title="Deck complete!"
          message={`You knew ${gotIt} of ${deck.length} (${pct}%).`}
        />
        <View style={{gap: spacing.md}}>
          {gotIt < deck.length ? <Button title="Practice the ones I missed" icon="repeat" onPress={() => restart(true)} fullWidth /> : null}
          <Button title="Shuffle and restart" variant="outline" icon="shuffle" onPress={() => restart(false)} fullWidth />
          <Button title="Take the signs quiz" variant="ghost" icon="target" onPress={() => navigation.replace('Quiz', {spec: {mode: 'signs'}})} fullWidth />
        </View>
      </Screen>
    );
  }

  const card = deck[index];
  const frontRotate = flip.interpolate({inputRange: [0, 1], outputRange: ['0deg', '180deg']});
  const backRotate = flip.interpolate({inputRange: [0, 1], outputRange: ['180deg', '360deg']});
  const cardStyle = [styles.card, {backgroundColor: colors.surface, borderRadius: radius.xl, borderColor: colors.border, padding: spacing.xl}];

  return (
    <Screen
      scroll={false}
      footer={
        <View style={[styles.row, {gap: spacing.md}]}>
          <Button title="Still learning" variant="outline" icon="repeat" onPress={() => rate(false)} style={styles.flex} testID="flash-learning" />
          <Button title="Got it" variant="success" icon="check" onPress={() => rate(true)} style={styles.flex} testID="flash-known" />
        </View>
      }>
      <View style={[styles.row, {gap: spacing.sm}]}>
        <Text variant="captionStrong" color="textMuted" style={styles.flex}>
          {categoryTitle} · {index + 1} / {deck.length}
        </Text>
        <Chip label={onlyLearning ? 'Learning only' : 'All cards'} icon="sliders" onPress={() => restart(!onlyLearning)} />
      </View>
      <ProgressBar value={index / deck.length} height={6} style={{marginTop: spacing.sm}} />

      <Pressable
        onPress={toggleFlip}
        accessibilityRole="button"
        accessibilityLabel={flipped ? `${card.name}. ${card.meaning}` : 'Flashcard. Tap to reveal the meaning of this sign.'}
        accessibilityHint="Flips the card"
        style={[styles.flex, {marginTop: spacing.lg}]}>
        <Animated.View style={[cardStyle, {transform: [{perspective: 1000}, {rotateY: frontRotate}]}]}>
          <SignImage code={card.code} size={200} accessibilityLabel="" />
          <View style={[styles.hint, {gap: spacing.xs}]}>
            <Icon name="repeat" size={16} color="textFaint" />
            <Text variant="caption" color="textFaint">
              Tap to flip
            </Text>
          </View>
        </Animated.View>
        <Animated.View style={[cardStyle, styles.back, {transform: [{perspective: 1000}, {rotateY: backRotate}]}]}>
          <SignImage code={card.code} size={90} accessibilityLabel="" />
          <Text variant="title" align="center" style={{marginTop: spacing.lg}}>
            {card.name}
          </Text>
          <Text variant="body" color="textMuted" align="center" style={{marginTop: spacing.sm}}>
            {card.meaning}
          </Text>
          <Button title="Hear it" variant="ghost" size="sm" icon="volume" onPress={() => speech.speak(`${card.name}. ${card.meaning}`)} style={{marginTop: spacing.md}} />
        </Animated.View>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backfaceVisibility: 'hidden',
  },
  back: {},
  hint: {position: 'absolute', bottom: 20, flexDirection: 'row', alignItems: 'center'},
});
