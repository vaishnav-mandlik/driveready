/**
 * Small building blocks shared by the Home and Practice screens. They compose
 * the app UI kit (Card, IconTile, Badge, Chip...) and only use theme colors.
 */
import React, {memo, useMemo} from 'react';
import {Pressable, StyleProp, StyleSheet, Text as RNText, View, ViewStyle} from 'react-native';
import {Badge, Card, Chip, Icon, IconName, IconTile, Text} from '../../../components';
import type {Tone} from '../../../components';
import type {TextVariant} from '../../../theme/tokens';
import {haptic} from '../../../native';
import {useTheme} from '../../../theme/ThemeProvider';
import type {QuestionStatus} from './practiceData';

const clamp01 = (v: number) => (Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0);

export interface PressableCardProps {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  testID?: string;
  /** Style of the outer pressable (flex/grid sizing). */
  style?: StyleProp<ViewStyle>;
  /** Style of the inner card. */
  cardStyle?: StyleProp<ViewStyle>;
  variant?: 'default' | 'outlined' | 'tinted';
  tint?: string;
}

/** A `Card` that can be pressed or disabled (with proper accessibility state). */
export function PressableCard({
  children,
  onPress,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
  cardStyle,
  variant,
  tint,
}: PressableCardProps) {
  return (
    <Pressable
      onPress={() => {
        haptic('tap');
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{disabled: !!disabled}}
      testID={testID}
      style={({pressed}) => [styles.pressableCard, pressed && !disabled && styles.pressed, style]}>
      <Card variant={disabled ? 'outlined' : variant} tint={tint} style={[styles.fill, cardStyle, disabled && styles.disabled]}>
        {children}
      </Card>
    </Pressable>
  );
}

export interface ModeTileProps {
  title: string;
  subtitle: string;
  icon: IconName;
  /** Icon color (the tile background is a translucent version). */
  color: string;
  onPress: () => void;
  /** Count bubble (e.g. mistakes to review). Hidden when 0/undefined. */
  badge?: number;
  /** Shows a check mark (e.g. Daily Challenge done today). */
  done?: boolean;
  disabled?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/** Grid tile for a practice mode / quick action. */
export const ModeTile = memo(function ModeTile({title, subtitle, icon, color, onPress, badge, done, disabled, testID, style}: ModeTileProps) {
  const {colors, spacing} = useTheme();
  return (
    <PressableCard
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityLabel={`${title}. ${subtitle}`}
      style={[styles.tile, style]}
      cardStyle={{padding: spacing.md + 2}}>
      <View style={styles.tileTop}>
        <IconTile name={icon} color={color} size={40} />
        {done ? (
          <View style={[styles.doneDot, {backgroundColor: colors.success}]}>
            <Icon name="check" size={14} color="#FFFFFF" strokeWidth={3} />
          </View>
        ) : badge ? (
          <Badge value={badge > 99 ? '99+' : badge} />
        ) : null}
      </View>
      <Text variant="bodyStrong" numberOfLines={2} style={{marginTop: spacing.md}}>
        {title}
      </Text>
      <Text variant="caption" color={done ? 'success' : 'textMuted'} numberOfLines={2} style={styles.tileSubtitle}>
        {subtitle}
      </Text>
    </PressableCard>
  );
});

/** Two-column wrapping grid with consistent gaps. */
export function TileGrid({children, style}: {children: React.ReactNode; style?: StyleProp<ViewStyle>}) {
  const {spacing} = useTheme();
  return <View style={[styles.grid, {gap: spacing.md}, style]}>{children}</View>;
}

/**
 * Two-layer progress: questions practiced (light) and mastered (solid).
 * Text next to it always states the numbers, so color is not the only signal.
 */
export function MasteryBar({
  seen,
  mastered,
  total,
  color,
  height = 6,
  style,
}: {
  seen: number;
  mastered: number;
  total: number;
  color: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const {colors} = useTheme();
  const seenPct = total ? clamp01(seen / total) : 0;
  const masteredPct = total ? clamp01(mastered / total) : 0;
  const r = height / 2;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`${seen} of ${total} practiced, ${mastered} mastered`}
      accessibilityValue={{min: 0, max: 100, now: Math.round(seenPct * 100)}}
      style={[styles.bar, {height, borderRadius: r, backgroundColor: colors.surfaceAlt}, style]}>
      {seenPct > 0 ? (
        <View style={[styles.barFill, {width: `${seenPct * 100}%`, borderRadius: r, backgroundColor: color, opacity: 0.35}]} />
      ) : null}
      {masteredPct > 0 ? (
        <View style={[styles.barFill, {width: `${masteredPct * 100}%`, borderRadius: r, backgroundColor: color}]} />
      ) : null}
    </View>
  );
}

const STATUS_META: Record<QuestionStatus, {label: string; icon: IconName; tone: Tone}> = {
  new: {label: 'New', icon: 'sparkles', tone: 'neutral'},
  mistake: {label: 'Mistake', icon: 'circle-x', tone: 'danger'},
  learning: {label: 'Learning', icon: 'trending', tone: 'primary'},
  mastered: {label: 'Mastered', icon: 'badge-check', tone: 'success'},
};

export function statusLabel(status: QuestionStatus): string {
  return STATUS_META[status].label;
}

/** Icon + text learning status (never color alone). */
export function StatusChip({status}: {status: QuestionStatus}) {
  const meta = STATUS_META[status];
  return <Chip label={meta.label} icon={meta.icon} tone={meta.tone} />;
}

/** Lowercase search terms exactly like `searchBank` splits them. */
export function searchTerms(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Splits text into plain/matched parts for highlighting search terms. */
export function splitHighlights(text: string, terms: string[]): {text: string; match: boolean}[] {
  if (!terms.length) {
    return [{text, match: false}];
  }
  const sorted = [...terms].sort((a, b) => b.length - a.length).map(escapeRegExp);
  const re = new RegExp(`(${sorted.join('|')})`, 'gi');
  return text
    .split(re)
    .map((part, i) => ({text: part, match: i % 2 === 1}))
    .filter(p => p.text.length > 0);
}

/** Text with search terms emphasized (bold + primary color). */
export function HighlightText({
  text,
  terms,
  variant = 'body',
  numberOfLines,
}: {
  text: string;
  terms: string[];
  variant?: TextVariant;
  numberOfLines?: number;
}) {
  const {colors} = useTheme();
  const parts = useMemo(() => splitHighlights(text, terms), [text, terms]);
  return (
    <Text variant={variant} numberOfLines={numberOfLines}>
      {parts.map((p, i) =>
        p.match ? (
          <RNText key={i} style={[styles.highlight, {color: colors.primary}]}>
            {p.text}
          </RNText>
        ) : (
          p.text
        ),
      )}
    </Text>
  );
}

/** Small inline "label · value" stat used inside hero cards. */
export function InlineStat({icon, label, color}: {icon: IconName; label: string; color?: string}) {
  const {colors} = useTheme();
  return (
    <View style={styles.inlineStat}>
      <Icon name={icon} size={14} color={color ?? colors.textMuted} />
      <Text variant="caption" color="textMuted" style={styles.flexShrink}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pressableCard: {alignSelf: 'stretch'},
  fill: {flexGrow: 1},
  pressed: {opacity: 0.92, transform: [{scale: 0.985}]},
  disabled: {opacity: 0.5},
  tile: {flexBasis: '45%', flexGrow: 1},
  tileTop: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between'},
  tileSubtitle: {marginTop: 2},
  doneDot: {width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center'},
  grid: {flexDirection: 'row', flexWrap: 'wrap'},
  bar: {overflow: 'hidden', width: '100%'},
  barFill: {position: 'absolute', left: 0, top: 0, bottom: 0},
  highlight: {fontWeight: '700'},
  inlineStat: {flexDirection: 'row', alignItems: 'center', gap: 6},
  flexShrink: {flexShrink: 1},
});
