import React from 'react';
import {Pressable, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import Svg, {Rect, Text as SvgText} from 'react-native-svg';
import {haptic} from '../native';
import {useTheme} from '../theme/ThemeProvider';
import {Button} from './Button';
import {Icon, IconName} from './Icon';
import {Text} from './Text';

export type Tone = 'neutral' | 'primary' | 'success' | 'danger' | 'warning' | 'accent' | 'gold';

function useTone(tone: Tone) {
  const {colors} = useTheme();
  const map: Record<Tone, {fg: string; bg: string}> = {
    neutral: {fg: colors.textMuted, bg: colors.surfaceAlt},
    primary: {fg: colors.primary, bg: colors.primarySoft},
    success: {fg: colors.success, bg: colors.successSoft},
    danger: {fg: colors.danger, bg: colors.dangerSoft},
    warning: {fg: colors.warning, bg: colors.warningSoft},
    accent: {fg: colors.accent, bg: colors.accentSoft},
    gold: {fg: colors.gold, bg: colors.goldSoft},
  };
  return map[tone];
}

/** Small rounded label, optionally pressable/selected (filters). */
export function Chip({
  label,
  icon,
  tone = 'neutral',
  selected,
  onPress,
  style,
}: {
  label: string;
  icon?: IconName;
  tone?: Tone;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const {colors, radius} = useTheme();
  const t = useTone(tone);
  const fg = selected ? colors.onPrimary : t.fg;
  const bg = selected ? colors.primary : t.bg;
  const body = (
    <View style={[styles.chip, {backgroundColor: bg, borderRadius: radius.pill}, style]}>
      {icon ? <Icon name={icon} size={14} color={fg} /> : null}
      <Text variant="captionStrong" color={fg} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
  if (!onPress) {
    return body;
  }
  return (
    <Pressable
      onPress={() => {
        haptic('selection');
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{selected: !!selected}}
      hitSlop={4}>
      {body}
    </Pressable>
  );
}

/** Count bubble, e.g. number of due mistakes. */
export function Badge({value, tone = 'danger'}: {value: number | string; tone?: Tone}) {
  const t = useTone(tone);
  return (
    <View style={[styles.badge, {backgroundColor: t.fg}]}>
      <Text variant="captionStrong" color="#FFFFFF" style={styles.badgeText}>
        {value}
      </Text>
    </View>
  );
}

export function StatTile({
  label,
  value,
  icon,
  tone = 'primary',
  sublabel,
  style,
}: {
  label: string;
  value: string;
  icon?: IconName;
  tone?: Tone;
  sublabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const {colors, radius, spacing, dark} = useTheme();
  const t = useTone(tone);
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}${sublabel ? `, ${sublabel}` : ''}`}
      style={[
        styles.stat,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.md,
          borderColor: colors.border,
          borderWidth: dark ? 1 : 0,
        },
        style,
      ]}>
      {icon ? (
        <View style={[styles.statIcon, {backgroundColor: t.bg}]}>
          <Icon name={icon} size={16} color={t.fg} />
        </View>
      ) : null}
      <Text variant="heading" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text variant="caption" color="textMuted" numberOfLines={1}>
        {label}
      </Text>
      {sublabel ? (
        <Text variant="caption" color="textFaint" numberOfLines={1}>
          {sublabel}
        </Text>
      ) : null}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const {colors, spacing} = useTheme();
  return (
    <View style={[styles.empty, {paddingVertical: spacing.huge, paddingHorizontal: spacing.xl}]}>
      <View style={[styles.emptyIcon, {backgroundColor: colors.primarySoft}]}>
        <Icon name={icon} size={32} color={colors.primary} />
      </View>
      <Text variant="heading" align="center" style={{marginTop: spacing.lg}}>
        {title}
      </Text>
      <Text variant="body" color="textMuted" align="center" style={{marginTop: spacing.sm}}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={{marginTop: spacing.xl}} />
      ) : null}
    </View>
  );
}

export interface SegmentOption<T extends string | number> {
  label: string;
  value: T;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  style,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const {colors, radius} = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.segment, {backgroundColor: colors.surfaceAlt, borderRadius: radius.md}, style]}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="tab"
            accessibilityState={{selected: active}}
            onPress={() => {
              haptic('selection');
              onChange(o.value);
            }}
            style={[
              styles.segmentItem,
              {borderRadius: radius.sm},
              active && {backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1},
            ]}>
            <Text variant="captionStrong" color={active ? 'text' : 'textMuted'} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Large title header for tab screens. */
export function LargeHeader({title, subtitle, right}: {title: string; subtitle?: string; right?: React.ReactNode}) {
  const {spacing} = useTheme();
  return (
    <View style={[styles.header, {marginBottom: spacing.lg}]}>
      <View style={styles.flex}>
        {subtitle ? (
          <Text variant="captionStrong" color="textMuted">
            {subtitle}
          </Text>
        ) : null}
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}

export interface BarDatum {
  label: string;
  value: number;
  highlight?: boolean;
}

/** Minimal bar chart (activity per day). */
export function BarChart({data, height = 120, color, accessibilityLabel}: {data: BarDatum[]; height?: number; color?: string; accessibilityLabel?: string}) {
  const {colors} = useTheme();
  const [width, setWidth] = React.useState(0);
  const max = Math.max(1, ...data.map(d => d.value));
  const labelH = 18;
  const gap = 6;
  const barW = data.length ? Math.max(4, (width - gap * (data.length - 1)) / data.length) : 0;
  return (
    <View
      onLayout={e => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityLabel={accessibilityLabel}
      style={{height: height + labelH}}>
      {width > 0 ? (
        <Svg width={width} height={height + labelH}>
          {data.map((d, i) => {
            const h = d.value > 0 ? Math.max(4, (d.value / max) * (height - 4)) : 3;
            const x = i * (barW + gap);
            return (
              <React.Fragment key={d.label + i}>
                <Rect
                  x={x}
                  y={height - h}
                  width={barW}
                  height={h}
                  rx={Math.min(6, barW / 2)}
                  fill={d.value > 0 ? (d.highlight ? color ?? colors.primary : (color ?? colors.primary) + '99') : colors.surfaceAlt}
                />
                <SvgText x={x + barW / 2} y={height + 14} fontSize={10} fill={colors.textFaint} textAnchor="middle">
                  {d.label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  chip: {flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start'},
  badge: {minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center'},
  badgeText: {fontSize: 12, lineHeight: 14},
  stat: {flex: 1, gap: 2},
  statIcon: {width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6},
  empty: {alignItems: 'center'},
  emptyIcon: {width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center'},
  segment: {flexDirection: 'row', padding: 3},
  segmentItem: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 4},
  header: {flexDirection: 'row', alignItems: 'flex-end', gap: 12},
});
