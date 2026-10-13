import React from 'react';
import {Card, Screen, SectionHeader, Text} from '../../components';
import {SUPPORT_EMAIL} from '../../config';
import type {RootScreenProps} from '../../navigation/types';
import {useTheme} from '../../theme/ThemeProvider';

const SECTIONS: {title: string; body: string}[] = [
  {title: 'The short version', body: 'DriveReady does not collect, store, sell, or share any personal information. There is no account, no advertising, no analytics and no tracking. The app does not access the internet.'},
  {title: 'Information we collect', body: 'None. We never receive any information about you or how you use the app.'},
  {title: 'Information stored on your device', body: 'Your selected state and test, settings, answers and progress, saved questions, exam history, achievements and driving log are stored only on this device. Erase them anytime in Settings → Reset study progress, or by uninstalling the app. If Android Backup is on, your device may include this data in your personal Google backup so it can be restored on a new phone; we never have access to it.'},
  {title: 'Permissions', body: 'Notifications (optional) are used only for the daily study reminder you turn on. "Run at startup" is used only to restore that reminder after your phone restarts. Read-aloud uses your phone’s built-in text-to-speech.'},
  {title: 'Children', body: 'DriveReady is suitable for teens preparing for their permit. Because the app collects no information from anyone, it collects none from children.'},
  {title: 'Links to official websites', body: 'The app links to official government handbooks and websites so you can verify information. Those sites have their own privacy policies. DriveReady is not affiliated with any government agency.'},
];

export function PrivacyScreen(_props: RootScreenProps<'Privacy'>) {
  const {spacing} = useTheme();
  return (
    <Screen>
      <Text variant="caption" color="textMuted">
        Effective October 13, 2026
      </Text>
      {SECTIONS.map(s => (
        <React.Fragment key={s.title}>
          <SectionHeader title={s.title} />
          <Card>
            <Text variant="body">{s.body}</Text>
          </Card>
        </React.Fragment>
      ))}
      <SectionHeader title="Contact" />
      <Card>
        <Text variant="body">Questions about privacy? Email {SUPPORT_EMAIL}.</Text>
      </Card>
      <Text variant="caption" color="textFaint" style={{marginTop: spacing.lg}}>
        If this policy changes, the updated version will appear here and on our website.
      </Text>
    </Screen>
  );
}
