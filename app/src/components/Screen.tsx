import React from 'react';
import {RefreshControlProps, ScrollView, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {Edge, SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeProvider';

export interface ScreenProps {
  children: React.ReactNode;
  /** Wrap content in a ScrollView (default true). */
  scroll?: boolean;
  /** Horizontal + vertical content padding (default true). */
  padded?: boolean;
  /**
   * Safe-area edges to respect. Tab screens without a native header pass ['top'];
   * stack screens with a header use the default (none) — the header handles the top.
   */
  edges?: Edge[];
  /** Add the bottom safe-area inset under the content (default true for stack screens). */
  bottomInset?: boolean;
  /** Sticky area pinned to the bottom (e.g. primary action buttons). */
  footer?: React.ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  edges = [],
  bottomInset = true,
  footer,
  refreshControl,
  contentContainerStyle,
  style,
  testID,
}: ScreenProps) {
  const {colors, spacing} = useTheme();
  const insets = useSafeAreaInsets();
  const pad = padded ? {paddingHorizontal: spacing.lg, paddingTop: spacing.lg} : null;
  const bottomPad = (padded ? spacing.xxl : 0) + (bottomInset && !footer ? insets.bottom : 0);

  return (
    <SafeAreaView edges={edges} style={[styles.flex, {backgroundColor: colors.background}, style]} testID={testID}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[pad, {paddingBottom: bottomPad}, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, pad, {paddingBottom: footer ? 0 : bottomPad}, contentContainerStyle]}>{children}</View>
      )}
      {footer ? (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.md,
              paddingBottom: spacing.md + (bottomInset ? insets.bottom : 0),
            },
          ]}>
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  footer: {borderTopWidth: StyleSheet.hairlineWidth},
});
