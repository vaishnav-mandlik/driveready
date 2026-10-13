import React from 'react';
import {Pressable, StyleProp, StyleSheet, Switch, View, ViewStyle} from 'react-native';
import {haptic} from '../native';
import {useTheme} from '../theme/ThemeProvider';
import {Icon, IconName} from './Icon';
import {Text} from './Text';

/** Colored rounded-square icon used at the start of rows and tiles. */
export function IconTile({name, color, size = 40, iconSize}: {name: IconName; color: string; size?: number; iconSize?: number}) {
  return (
    <View style={[styles.tile, {width: size, height: size, borderRadius: size * 0.3, backgroundColor: color + '22'}]}>
      <Icon name={name} size={iconSize ?? Math.round(size * 0.5)} color={color} />
    </View>
  );
}

export interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  /** Icon color (tile background is a translucent version). */
  iconColor?: string;
  /** Short value shown on the right (e.g. "On", "12"). */
  value?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  testID?: string;
}

export function ListRow({
  title,
  subtitle,
  icon,
  iconColor,
  value,
  right,
  onPress,
  chevron = !!onPress,
  destructive,
  disabled,
  style,
  accessibilityHint,
  testID,
}: ListRowProps) {
  const {colors, spacing} = useTheme();
  const content = (
    <>
      {icon ? <IconTile name={icon} color={destructive ? colors.danger : iconColor ?? colors.primary} size={36} /> : null}
      <View style={styles.flex}>
        <Text variant="bodyStrong" color={destructive ? 'danger' : 'text'} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="textMuted" numberOfLines={3} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="captionStrong" color="textMuted">
          {value}
        </Text>
      ) : null}
      {right}
      {chevron ? <Icon name="chevron-right" size={20} color="textFaint" /> : null}
    </>
  );
  const rowStyle = [styles.row, {paddingVertical: spacing.md, gap: spacing.md, opacity: disabled ? 0.5 : 1}, style];
  if (!onPress) {
    return (
      <View style={rowStyle} testID={testID}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={() => {
        haptic('selection');
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      accessibilityHint={accessibilityHint}
      testID={testID}
      style={({pressed}) => [...rowStyle, pressed && {opacity: 0.6}]}>
      {content}
    </Pressable>
  );
}

export function ToggleRow({
  title,
  subtitle,
  icon,
  iconColor,
  value,
  onValueChange,
  disabled,
  testID,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconColor?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  testID?: string;
}) {
  const {colors} = useTheme();
  return (
    <ListRow
      title={title}
      subtitle={subtitle}
      icon={icon}
      iconColor={iconColor}
      disabled={disabled}
      testID={testID}
      right={
        <Switch
          value={value}
          disabled={disabled}
          onValueChange={v => {
            haptic('selection');
            onValueChange(v);
          }}
          trackColor={{true: colors.primary, false: colors.border}}
          thumbColor="#FFFFFF"
          accessibilityLabel={title}
        />
      }
    />
  );
}

export function Divider({inset = 0, style}: {inset?: number; style?: StyleProp<ViewStyle>}) {
  const {colors} = useTheme();
  return <View style={[{height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: inset}, style]} />;
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
  style,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const {spacing} = useTheme();
  return (
    <View style={[styles.sectionHeader, {marginTop: spacing.xxl, marginBottom: spacing.sm}, style]}>
      <Text variant="label" color="textMuted" accessibilityRole="header">
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
          <Text variant="captionStrong" color="primary">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {alignItems: 'center', justifyContent: 'center'},
  row: {flexDirection: 'row', alignItems: 'center'},
  flex: {flex: 1},
  subtitle: {marginTop: 2},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
});
