import React from 'react';
import {Alert, Linking, StyleSheet, View} from 'react-native';
import {Card, Chip, Divider, ListRow, Screen, SectionHeader, SegmentedControl, Text, ToggleRow} from '../../components';
import {APP_VERSION, PLAY_STORE_URL, SUPPORT_EMAIL} from '../../config';
import {stateName} from '../../data/states';
import {getTrack} from '../../data/tracks';
import {parseDayKey} from '../../engine/dates';
import {defineStrings, LANGUAGES, type Lang, useStrings} from '../../i18n';
import {reminders} from '../../native';
import type {RootScreenProps} from '../../navigation/types';
import {useDriveLog} from '../../store/driveLog';
import {useProgress} from '../../store/progress';
import {ThemeMode, useSettings} from '../../store/settings';
import {hueAt, useTheme} from '../../theme/ThemeProvider';
import {reminderCopy} from '../onboarding/GoalScreen';
import {shortDate} from '../practice/shared/format';

const HOURS = [8, 12, 17, 19, 21];

const STR = defineStrings(
  {
    hour: (h: number) => (h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`),
    notifOffTitle: 'Notifications are off',
    notifOffBody: 'Allow notifications for DriveReady in your phone settings to get study reminders.',
    notNow: 'Not now',
    openSettings: 'Open settings',
    resetTitle: 'Reset all progress?',
    resetBody: 'This erases your answers, mistakes, saved questions, exam history, streaks and achievements on this device. It cannot be undone.',
    cancel: 'Cancel',
    reset: 'Reset',
    sureTitle: 'Are you sure?',
    sureBody: 'All study progress will be permanently deleted.',
    deleteAll: 'Delete everything',
    yourTest: 'Your test',
    state: 'State',
    licenseType: 'License type',
    goals: 'Goals & test date',
    perDay: (n: number) => `${n}/day`,
    study: 'Study',
    shuffle: 'Shuffle answer choices',
    shuffleSub: 'Stops you memorizing positions',
    autoAdvance: 'Auto-advance',
    autoAdvanceSub: 'Go to the next question after a correct answer',
    timer: 'Exam timer',
    timerSub: "Count down when your state's test is timed",
    realistic: 'Realistic exam ending',
    realisticSub: "Stop the exam once you've passed or failed",
    reminder: 'Daily study reminder',
    reminderAt: (time: string) => `Every day at ${time}`,
    off: 'Off',
    speechRate: 'Read-aloud speed',
    slower: 'Slower',
    normal: 'Normal',
    faster: 'Faster',
    appearance: 'Appearance',
    theme: 'Theme',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
    textSize: 'Text size',
    sizeDefault: 'Default',
    sizeLarge: 'Large',
    sizeXL: 'Extra large',
    haptics: 'Haptic feedback',
    hapticsSub: 'Gentle vibration on answers',
    data: 'Data',
    resetProgress: 'Reset study progress',
    clearLog: 'Clear driving log',
    clearLogTitle: 'Clear the driving log?',
    clearLogBody: 'All logged drives will be deleted.',
    clear: 'Clear',
    about: 'About',
    aboutApp: 'About DriveReady',
    sources: 'Official sources',
    privacy: 'Privacy policy',
    rate: 'Rate the app',
    feedback: 'Send feedback',
    feedbackSubject: 'DriveReady feedback',
    emailUs: 'Email us',
    footer: (version: string) => `DriveReady ${version} · Every feature free, forever`,
  },
  {
    hour: (h: number) => (h === 12 ? '12 p. m.' : h > 12 ? `${h - 12} p. m.` : `${h} a. m.`),
    notifOffTitle: 'Las notificaciones están desactivadas',
    notifOffBody: 'Permite las notificaciones de DriveReady en los ajustes de tu teléfono para recibir recordatorios de estudio.',
    notNow: 'Ahora no',
    openSettings: 'Abrir ajustes',
    resetTitle: '¿Restablecer todo el progreso?',
    resetBody: 'Esto borra tus respuestas, errores, preguntas guardadas, historial de exámenes, rachas y logros en este dispositivo. No se puede deshacer.',
    cancel: 'Cancelar',
    reset: 'Restablecer',
    sureTitle: '¿Estás seguro?',
    sureBody: 'Todo tu progreso de estudio se eliminará para siempre.',
    deleteAll: 'Borrar todo',
    yourTest: 'Tu examen',
    state: 'Estado',
    licenseType: 'Tipo de licencia',
    goals: 'Metas y fecha del examen',
    perDay: (n: number) => `${n}/día`,
    study: 'Estudio',
    shuffle: 'Mezclar opciones de respuesta',
    shuffleSub: 'Evita que memorices las posiciones',
    autoAdvance: 'Avance automático',
    autoAdvanceSub: 'Pasa a la siguiente pregunta cuando aciertas',
    timer: 'Temporizador del examen',
    timerSub: 'Cuenta regresiva si el examen de tu estado tiene tiempo límite',
    realistic: 'Final de examen realista',
    realisticSub: 'Termina el examen en cuanto apruebes o repruebes',
    reminder: 'Recordatorio diario de estudio',
    reminderAt: (time: string) => `Todos los días a las ${time}`,
    off: 'Desactivado',
    speechRate: 'Velocidad de lectura en voz alta',
    slower: 'Más lenta',
    normal: 'Normal',
    faster: 'Más rápida',
    appearance: 'Apariencia',
    theme: 'Tema',
    system: 'Sistema',
    light: 'Claro',
    dark: 'Oscuro',
    textSize: 'Tamaño del texto',
    sizeDefault: 'Normal',
    sizeLarge: 'Grande',
    sizeXL: 'Muy grande',
    haptics: 'Vibración',
    hapticsSub: 'Vibración suave al responder',
    data: 'Datos',
    resetProgress: 'Restablecer progreso de estudio',
    clearLog: 'Borrar registro de manejo',
    clearLogTitle: '¿Borrar el registro de manejo?',
    clearLogBody: 'Se eliminarán todas las prácticas registradas.',
    clear: 'Borrar',
    about: 'Acerca de',
    aboutApp: 'Acerca de DriveReady',
    sources: 'Fuentes oficiales',
    privacy: 'Política de privacidad',
    rate: 'Calificar la app',
    feedback: 'Enviar comentarios',
    feedbackSubject: 'Comentarios sobre DriveReady',
    emailUs: 'Escríbenos',
    footer: (version: string) => `DriveReady ${version} · Todas las funciones gratis, para siempre`,
  },
);

export function SettingsScreen({navigation}: RootScreenProps<'Settings'>) {
  const {colors, spacing} = useTheme();
  const s = useSettings();
  const resetProgress = useProgress(p => p.resetProgress);
  const resetLog = useDriveLog(d => d.resetLog);
  const t = useStrings(STR);
  const hourLabel = t.hour;

  const setReminder = async (enabled: boolean, hour = s.reminder.hour) => {
    if (!enabled) {
      reminders.cancel();
      s.update({reminder: {...s.reminder, enabled: false, hour}});
      return;
    }
    const copy = reminderCopy(s.state);
    const ok = await reminders.schedule(hour, 0, copy.title, copy.body).catch(() => false);
    if (!ok) {
      Alert.alert(t.notifOffTitle, t.notifOffBody, [
        {text: t.notNow, style: 'cancel'},
        {text: t.openSettings, onPress: () => Linking.openSettings()},
      ]);
    }
    s.update({reminder: {enabled: ok, hour, minute: 0}});
  };

  const changeLanguage = (language: Lang) => {
    s.update({language});
    if (s.reminder.enabled) {
      // Re-schedule so the reminder text follows the new language.
      const copy = reminderCopy(s.state);
      reminders.schedule(s.reminder.hour, s.reminder.minute, copy.title, copy.body).catch(() => false);
    }
  };

  const confirmReset = () =>
    Alert.alert(t.resetTitle, t.resetBody, [
      {text: t.cancel, style: 'cancel'},
      {
        text: t.reset,
        style: 'destructive',
        onPress: () =>
          Alert.alert(t.sureTitle, t.sureBody, [
            {text: t.cancel, style: 'cancel'},
            {text: t.deleteAll, style: 'destructive', onPress: () => resetProgress()},
          ]),
      },
    ]);

  return (
    <Screen>
      <SectionHeader title={t.yourTest} style={{marginTop: 0}} />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        <ListRow title={t.state} value={stateName(s.state)} icon="map-pin" iconColor={hueAt(colors, 0)} onPress={() => navigation.navigate('PickState', {mode: 'change'})} />
        <Divider />
        <ListRow title={t.licenseType} value={getTrack(s.track).short} icon={getTrack(s.track).icon} iconColor={hueAt(colors, 3)} onPress={() => navigation.navigate('PickTrack', {mode: 'change'})} />
        <Divider />
        <ListRow
          title={t.goals}
          value={s.examDate ? shortDate(parseDayKey(s.examDate)) : t.perDay(s.dailyGoal)}
          icon="calendar"
          iconColor={hueAt(colors, 1)}
          onPress={() => navigation.navigate('Goal', {mode: 'change'})}
        />
      </Card>

      <SectionHeader title={t.study} />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        <ToggleRow title={t.shuffle} subtitle={t.shuffleSub} icon="shuffle" value={s.shuffleChoices} onValueChange={v => s.update({shuffleChoices: v})} />
        <Divider />
        <ToggleRow title={t.autoAdvance} subtitle={t.autoAdvanceSub} icon="arrow-right" value={s.autoAdvance} onValueChange={v => s.update({autoAdvance: v})} />
        <Divider />
        <ToggleRow title={t.timer} subtitle={t.timerSub} icon="timer" value={s.examTimer} onValueChange={v => s.update({examTimer: v})} />
        <Divider />
        <ToggleRow title={t.realistic} subtitle={t.realisticSub} icon="flag" value={s.realisticExam} onValueChange={v => s.update({realisticExam: v})} />
        {reminders.isSupported ? (
          <>
            <Divider />
            <ToggleRow title={t.reminder} subtitle={s.reminder.enabled ? t.reminderAt(hourLabel(s.reminder.hour)) : t.off} icon="bell" value={s.reminder.enabled} onValueChange={v => setReminder(v)} />
            {s.reminder.enabled ? (
              <View style={[styles.wrap, {gap: spacing.sm, paddingBottom: spacing.md}]}>
                {HOURS.map(h => (
                  <Chip key={h} label={hourLabel(h)} selected={s.reminder.hour === h} onPress={() => setReminder(true, h)} />
                ))}
              </View>
            ) : null}
          </>
        ) : null}
        <Divider />
        <View style={{paddingVertical: spacing.md, gap: spacing.sm}}>
          <Text variant="bodyStrong">{t.speechRate}</Text>
          <SegmentedControl
            options={[
              {label: t.slower, value: 0.8},
              {label: t.normal, value: 1},
              {label: t.faster, value: 1.2},
            ]}
            value={s.speechRate}
            onChange={v => s.update({speechRate: v})}
          />
        </View>
      </Card>

      <SectionHeader title={t.appearance} />
      <Card style={{gap: spacing.md}}>
        <Text variant="bodyStrong">{t.theme}</Text>
        <SegmentedControl<ThemeMode>
          options={[
            {label: t.system, value: 'system'},
            {label: t.light, value: 'light'},
            {label: t.dark, value: 'dark'},
          ]}
          value={s.theme}
          onChange={v => s.update({theme: v})}
        />
        <Text variant="bodyStrong">{t.textSize}</Text>
        <SegmentedControl
          options={[
            {label: t.sizeDefault, value: 1},
            {label: t.sizeLarge, value: 1.15},
            {label: t.sizeXL, value: 1.3},
          ]}
          value={s.textScale}
          onChange={v => s.update({textScale: v})}
        />
        <Text variant="bodyStrong">Language · Idioma</Text>
        <SegmentedControl<Lang> options={LANGUAGES.map(l => ({label: l.label, value: l.id}))} value={s.language} onChange={changeLanguage} />
      </Card>
      <Card padded={false} style={{paddingHorizontal: spacing.lg, marginTop: spacing.md}}>
        <ToggleRow title={t.haptics} subtitle={t.hapticsSub} icon="hand" value={s.haptics} onValueChange={v => s.update({haptics: v})} />
      </Card>

      <SectionHeader title={t.data} />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        <ListRow title={t.resetProgress} icon="reset" destructive onPress={confirmReset} chevron={false} />
        <Divider />
        <ListRow
          title={t.clearLog}
          icon="trash"
          destructive
          chevron={false}
          onPress={() =>
            Alert.alert(t.clearLogTitle, t.clearLogBody, [
              {text: t.cancel, style: 'cancel'},
              {text: t.clear, style: 'destructive', onPress: () => resetLog()},
            ])
          }
        />
      </Card>

      <SectionHeader title={t.about} />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        <ListRow title={t.aboutApp} icon="info" iconColor={hueAt(colors, 0)} onPress={() => navigation.navigate('About')} />
        <Divider />
        <ListRow title={t.sources} icon="shield-check" iconColor={hueAt(colors, 1)} onPress={() => navigation.navigate('Sources')} />
        <Divider />
        <ListRow title={t.privacy} icon="lock" iconColor={hueAt(colors, 5)} onPress={() => navigation.navigate('Privacy')} />
        <Divider />
        <ListRow title={t.rate} icon="star" iconColor={hueAt(colors, 2)} onPress={() => Linking.openURL(PLAY_STORE_URL).catch(() => undefined)} />
        <Divider />
        <ListRow
          title={t.feedback}
          subtitle={SUPPORT_EMAIL}
          icon="mail"
          iconColor={hueAt(colors, 3)}
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t.feedbackSubject)}`).catch(() => Alert.alert(t.emailUs, SUPPORT_EMAIL))}
        />
      </Card>
      <Text variant="caption" color="textFaint" align="center" style={{marginTop: spacing.lg}}>
        {t.footer(APP_VERSION)}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {flexDirection: 'row', flexWrap: 'wrap'},
});
