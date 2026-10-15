import React from 'react';
import {StyleSheet, View} from 'react-native';
import {defineStrings, useStrings} from '../i18n';
import {useTheme} from '../theme/ThemeProvider';
import {Button} from './Button';
import {Icon} from './Icon';
import {Text} from './Text';

const STR = defineStrings(
  {
    title: 'Something went wrong',
    body: 'This screen ran into a problem. Your progress is saved.',
    retry: 'Try again',
    home: 'Go to Home',
  },
  {
    title: 'Algo salió mal',
    body: 'Esta pantalla tuvo un problema. Tu progreso está guardado.',
    retry: 'Intentar de nuevo',
    home: 'Ir al inicio',
  },
);

function Fallback({onRetry, onHome}: {onRetry: () => void; onHome: () => void}) {
  const {colors, spacing} = useTheme();
  const t = useStrings(STR);
  return (
    <View style={[styles.root, {backgroundColor: colors.background, padding: spacing.xl, gap: spacing.md}]} accessibilityRole="alert">
      <Icon name="warning" size={40} color={colors.warning} />
      <Text variant="title" align="center">
        {t.title}
      </Text>
      <Text variant="body" color="textMuted" align="center">
        {t.body}
      </Text>
      <View style={{gap: spacing.sm, marginTop: spacing.md, alignSelf: 'stretch'}}>
        <Button title={t.retry} icon="reset" onPress={onRetry} fullWidth testID="error-retry" />
        <Button title={t.home} variant="outline" icon="home" onPress={onHome} fullWidth testID="error-home" />
      </View>
    </View>
  );
}

interface Props {
  children: React.ReactNode;
  /** Called before re-rendering from the Home screen (e.g. to drop the saved navigation state). */
  onGoHome?: () => void;
}

/**
 * Root crash guard: a rendering error in any screen shows a recovery screen instead of closing the app.
 * Nothing is sent anywhere (no analytics); native crashes still appear in Play Console's Android vitals.
 */
export class ErrorBoundary extends React.Component<Props, {failed: boolean; attempt: number}> {
  state = {failed: false, attempt: 0};

  static getDerivedStateFromError() {
    return {failed: true};
  }

  componentDidCatch(error: unknown) {
    if (__DEV__) {
      console.error('ErrorBoundary caught', error);
    }
  }

  private retry = () => this.setState(s => ({failed: false, attempt: s.attempt + 1}));

  private home = () => {
    this.props.onGoHome?.();
    this.retry();
  };

  render() {
    if (this.state.failed) {
      return <Fallback onRetry={this.retry} onHome={this.home} />;
    }
    return <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>;
  }
}

const styles = StyleSheet.create({
  root: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});
