import React, {useEffect, useRef, useState} from 'react';
import {AppState, StyleSheet, View} from 'react-native';
import {Icon} from '../Icon';
import {ProgressBar} from '../Progress';
import {Text} from '../Text';
import {formatClock} from '../../engine/dates';
import {defineStrings, useStrings} from '../../i18n';
import {useTheme} from '../../theme/ThemeProvider';

/** Whole seconds left until `deadline` (never negative). Timestamp-based, so it is exact after backgrounding. */
export function secondsLeft(deadline: number, now: number = Date.now()): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

const STR = defineStrings(
  {
    minutes: (n: number) => `${n} minute${n === 1 ? '' : 's'}`,
    seconds: (n: number) => `${n} second${n === 1 ? '' : 's'}`,
    timeLeft: (time: string) => `Time left: ${time}`,
  },
  {
    minutes: (n: number) => `${n} minuto${n === 1 ? '' : 's'}`,
    seconds: (n: number) => `${n} segundo${n === 1 ? '' : 's'}`,
    timeLeft: (time: string) => `Tiempo restante: ${time}`,
  },
);

function spokenTime(sec: number, t: (typeof STR)['en']): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const parts = [];
  if (m) {
    parts.push(t.minutes(m));
  }
  if (s || !m) {
    parts.push(t.seconds(s));
  }
  return parts.join(' ');
}

/**
 * Calls `onExpire` once when `deadline` passes. Uses wall-clock timestamps (not
 * tick counting), polls cheaply and re-checks immediately when the app returns
 * to the foreground — JS timers may not run while the app is in the background.
 */
export function useDeadline(deadline: number | null, active: boolean, onExpire: () => void) {
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const firedRef = useRef(false);

  useEffect(() => {
    if (deadline === null || !active) {
      return;
    }
    const check = () => {
      if (!firedRef.current && Date.now() >= deadline) {
        firedRef.current = true;
        onExpireRef.current();
      }
    };
    check();
    const id = setInterval(check, 500);
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        check();
      }
    });
    return () => {
      clearInterval(id);
      sub?.remove();
    };
  }, [deadline, active]);
}

/** Live countdown pill (and optional draining bar). Re-renders only itself, once per second. */
export function CountdownTimer({
  deadline,
  totalSec,
  paused = false,
  showBar = false,
  warnAt = 60,
  dangerAt = 30,
}: {
  deadline: number;
  totalSec: number;
  /** Freeze the display (session over). */
  paused?: boolean;
  showBar?: boolean;
  warnAt?: number;
  dangerAt?: number;
}) {
  const {colors, radius, spacing} = useTheme();
  const t = useStrings(STR);
  const [left, setLeft] = useState(() => secondsLeft(deadline));

  useEffect(() => {
    if (paused) {
      return;
    }
    const tick = () => setLeft(secondsLeft(deadline));
    tick();
    const id = setInterval(tick, 250);
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        tick();
      }
    });
    return () => {
      clearInterval(id);
      sub?.remove();
    };
  }, [deadline, paused]);

  const tone = left <= dangerAt ? 'danger' : left <= warnAt ? 'warning' : 'neutral';
  const fg = tone === 'danger' ? colors.danger : tone === 'warning' ? colors.warning : colors.text;
  const bg = tone === 'danger' ? colors.dangerSoft : tone === 'warning' ? colors.warningSoft : colors.surfaceAlt;

  const pill = (
    <View
      accessible
      accessibilityRole="timer"
      accessibilityLabel={t.timeLeft(spokenTime(left, t))}
      testID="countdown"
      style={[styles.pill, {backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: spacing.md, gap: spacing.xs}]}>
      <Icon name="timer" size={16} color={fg} />
      <Text variant="captionStrong" color={fg} style={styles.digits}>
        {formatClock(left)}
      </Text>
    </View>
  );

  if (!showBar) {
    return pill;
  }
  return (
    <View style={[styles.withBar, {gap: spacing.sm}]}>
      <ProgressBar
        value={totalSec > 0 ? left / totalSec : 0}
        color={tone === 'neutral' ? colors.primary : fg}
        height={6}
        style={styles.flex}
      />
      {pill}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {flexDirection: 'row', alignItems: 'center', paddingVertical: 5, alignSelf: 'flex-start'},
  digits: {fontVariant: ['tabular-nums']},
  withBar: {flexDirection: 'row', alignItems: 'center', flex: 1},
  flex: {flex: 1},
});
