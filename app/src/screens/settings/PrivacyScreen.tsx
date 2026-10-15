import React from 'react';
import {Card, Screen, SectionHeader, Text} from '../../components';
import {SUPPORT_EMAIL} from '../../config';
import {defineStrings, useStrings} from '../../i18n';
import type {RootScreenProps} from '../../navigation/types';
import {useTheme} from '../../theme/ThemeProvider';

type Section = {title: string; body: string};

const STR = defineStrings(
  {
    sections: [
      {title: 'The short version', body: 'DriveReady does not collect, store, sell, or share any personal information. There is no account, no advertising, no analytics and no tracking.'},
      {title: 'Information we collect', body: 'None. We never receive any information about you or how you use the app.'},
      {title: 'Question updates', body: 'About once a day the app may download updated questions and study material from our content server, so corrections reach you without an app update. These are plain downloads of public files: the app sends no account, no device ID and no study data. Like any website, the server sees the network address the request comes from; we do not use it to identify or track you. Everything works offline, and the questions built into the app are used whenever no update is available.'},
      {title: 'Information stored on your device', body: 'Your selected state and test, settings, answers and progress, saved questions, exam history, achievements and driving log are stored only on this device. Erase them anytime in Settings → Reset study progress, or by uninstalling the app. If Android Backup is on, your device may include this data in your personal Google backup so it can be restored on a new phone; we never have access to it.'},
      {title: 'Permissions', body: 'Notifications (optional) are used only for the daily study reminder you turn on. "Run at startup" is used only to restore that reminder after your phone restarts. Read-aloud uses your phone’s built-in text-to-speech.'},
      {title: 'Children', body: 'DriveReady is suitable for teens preparing for their permit. Because the app collects no information from anyone, it collects none from children.'},
      {title: 'Links to official websites', body: 'The app links to official government handbooks and websites so you can verify information. Those sites have their own privacy policies. DriveReady is not affiliated with any government agency.'},
    ] as Section[],
    effective: 'Effective October 14, 2026',
    contact: 'Contact',
    contactBody: (email: string) => `Questions about privacy? Email ${email}.`,
    changes: 'If this policy changes, the updated version will appear here and on our website.',
  },
  {
    sections: [
      {title: 'En resumen', body: 'DriveReady no recopila, guarda, vende ni comparte ninguna información personal. No hay cuenta, ni publicidad, ni analíticas, ni rastreo.'},
      {title: 'Información que recopilamos', body: 'Ninguna. Nunca recibimos información sobre ti ni sobre cómo usas la app.'},
      {title: 'Actualizaciones de preguntas', body: 'Aproximadamente una vez al día, la app puede descargar preguntas y material de estudio actualizados desde nuestro servidor de contenido, para que las correcciones te lleguen sin actualizar la app. Son descargas simples de archivos públicos: la app no envía ninguna cuenta, identificador del dispositivo ni datos de estudio. Como cualquier sitio web, el servidor ve la dirección de red desde la que llega la solicitud; no la usamos para identificarte ni rastrearte. Todo funciona sin conexión, y se usan las preguntas incluidas en la app cuando no hay una actualización disponible.'},
      {title: 'Información guardada en tu dispositivo', body: 'Tu estado y examen elegidos, tus ajustes, respuestas y progreso, preguntas guardadas, historial de exámenes, logros y registro de manejo se guardan solo en este dispositivo. Bórralos cuando quieras en Ajustes → Restablecer progreso de estudio, o desinstalando la app. Si la copia de seguridad de Android está activada, tu dispositivo puede incluir estos datos en tu copia de seguridad personal de Google para restaurarlos en un teléfono nuevo; nosotros nunca tenemos acceso a ellos.'},
      {title: 'Permisos', body: 'Las notificaciones (opcionales) se usan solo para el recordatorio diario de estudio que tú actives. "Ejecutar al inicio" se usa solo para restaurar ese recordatorio después de que se reinicie tu teléfono. La lectura en voz alta usa el sistema de texto a voz integrado en tu teléfono.'},
      {title: 'Menores de edad', body: 'DriveReady es apropiada para adolescentes que se preparan para su permiso. Como la app no recopila información de nadie, tampoco la recopila de menores.'},
      {title: 'Enlaces a sitios web oficiales', body: 'La app enlaza a manuales y sitios web oficiales del gobierno para que puedas verificar la información. Esos sitios tienen sus propias políticas de privacidad. DriveReady no está afiliada a ninguna agencia del gobierno.'},
    ] as Section[],
    effective: 'Vigente desde el 14 de octubre de 2026',
    contact: 'Contacto',
    contactBody: (email: string) => `¿Preguntas sobre privacidad? Escribe a ${email}.`,
    changes: 'Si esta política cambia, la versión actualizada aparecerá aquí y en nuestro sitio web.',
  },
);

export function PrivacyScreen(_props: RootScreenProps<'Privacy'>) {
  const {spacing} = useTheme();
  const t = useStrings(STR);
  return (
    <Screen>
      <Text variant="caption" color="textMuted">
        {t.effective}
      </Text>
      {t.sections.map(s => (
        <React.Fragment key={s.title}>
          <SectionHeader title={s.title} />
          <Card>
            <Text variant="body">{s.body}</Text>
          </Card>
        </React.Fragment>
      ))}
      <SectionHeader title={t.contact} />
      <Card>
        <Text variant="body">{t.contactBody(SUPPORT_EMAIL)}</Text>
      </Card>
      <Text variant="caption" color="textFaint" style={{marginTop: spacing.lg}}>
        {t.changes}
      </Text>
    </Screen>
  );
}
