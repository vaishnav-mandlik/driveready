import React, {useMemo, useState} from 'react';
import {Alert, Linking, StyleSheet, View} from 'react-native';
import {Button, Card, Chip, Divider, Icon, IconTile, ListRow, Screen, SectionHeader, Text, ToggleRow} from '../../components';
import {getTopic} from '../../data/tracks';
import type {ExamConfig} from '../../data/types';
import {formatDuration} from '../../engine/dates';
import {useLearner, useReadiness} from '../../hooks/useLearner';
import type {RootScreenProps} from '../../navigation/types';
import {useProgress} from '../../store/progress';
import {useSettings} from '../../store/settings';
import {useTheme} from '../../theme/ThemeProvider';

export function openOfficial(url: string, label = 'the official website') {
  if (!url) {
    return;
  }
  Alert.alert('Open in your browser?', `This opens ${label}.`, [
    {text: 'Cancel', style: 'cancel'},
    {text: 'Open', onPress: () => Linking.openURL(url).catch(() => Alert.alert('Could not open the link', url))},
  ]);
}

export function ExamIntroScreen({navigation, route}: RootScreenProps<'ExamIntro'>) {
  const {colors, spacing} = useTheme();
  const learner = useLearner();
  const examTimer = useSettings(s => s.examTimer);
  const realisticExam = useSettings(s => s.realisticExam);
  const update = useSettings(s => s.update);
  const [examId, setExamId] = useState(route.params?.examId ?? learner.exam.id);
  const exam: ExamConfig = learner.exams.find(e => e.id === examId) ?? learner.exam;
  const readiness = useReadiness(exam);
  const history = useProgress(s => s.exams);
  const attempts = useMemo(() => history.filter(h => h.examId === exam.id).slice(0, 3), [history, exam.id]);
  const pool = exam.topic ? learner.bank.byTopic.get(exam.topic)?.length ?? 0 : learner.bank.questions.length;

  return (
    <Screen
      footer={
        <Button
          title={pool ? 'Start exam' : 'No questions yet'}
          icon="play"
          size="lg"
          disabled={!pool}
          onPress={() => navigation.replace('Quiz', {spec: {mode: 'exam', examId: exam.id}})}
          fullWidth
          testID="exam-start"
        />
      }>
      {learner.exams.length > 1 ? (
        <>
          <Text variant="label" color="textMuted">
            Choose a test
          </Text>
          <View style={[styles.wrap, {gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.lg}]}>
            {learner.exams.map(e => (
              <Chip key={e.id} label={e.topic ? getTopic(e.topic)?.title ?? e.title : e.title} selected={e.id === exam.id} onPress={() => setExamId(e.id)} />
            ))}
          </View>
        </>
      ) : null}

      <Card>
        <View style={[styles.row, {gap: spacing.md}]}>
          <IconTile name="clipboard-check" color={colors.accent} size={48} />
          <View style={styles.flex}>
            <Text variant="heading" accessibilityRole="header">
              {exam.title}
            </Text>
            <Text variant="caption" color="textMuted">
              Same format as the real test — answers revealed at the end
            </Text>
          </View>
        </View>
        <View style={[styles.row, {marginTop: spacing.xl}]}>
          <Big value={String(exam.questions)} label="questions" />
          <Big value={String(exam.passingScore)} label="to pass" />
          <Big value={`${Math.round((exam.passingScore / Math.max(1, exam.questions)) * 100)}%`} label="passing score" />
          {exam.timeLimitMinutes ? <Big value={`${exam.timeLimitMinutes}m`} label="time limit" /> : null}
        </View>
        {exam.signs ? (
          <View style={[styles.row, {gap: spacing.sm, marginTop: spacing.lg}]}>
            <Icon name="signpost" size={18} color={colors.warning} />
            <Text variant="bodyStrong" style={styles.flex}>
              {exam.signs.questions} road-sign questions
              {exam.signs.passingScore !== null ? ` — you must get ${exam.signs.passingScore} right` : ''}
              {exam.rulesPassingScore != null ? `, and ${exam.rulesPassingScore} of ${exam.questions - exam.signs.questions} on the rules part` : ''}.
            </Text>
          </View>
        ) : null}
        {exam.notes ? (
          <Text variant="caption" color="textMuted" style={{marginTop: spacing.lg}}>
            {exam.notes}
          </Text>
        ) : null}
        {exam.sourceUrl ? (
          <Button title="Official test information" variant="ghost" size="sm" icon="external" onPress={() => openOfficial(exam.sourceUrl ?? '', 'the official test information page')} style={styles.left} />
        ) : null}
      </Card>

      <Card variant="tinted" tint={colors.primarySoft} style={[styles.row, {gap: spacing.md, marginTop: spacing.md}]}>
        <Icon name="sparkles" color={colors.primary} />
        <Text variant="body" style={styles.flex}>
          Your estimated pass chance: <Text variant="bodyStrong">{Math.round(readiness.passProbability * 100)}%</Text>
        </Text>
      </Card>

      <SectionHeader title="Exam settings" />
      <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
        <ToggleRow
          title="Show timer"
          subtitle={exam.timeLimitMinutes ? `Counts down from ${exam.timeLimitMinutes} minutes like the real test` : 'This test has no official time limit'}
          icon="timer"
          value={examTimer && !!exam.timeLimitMinutes}
          disabled={!exam.timeLimitMinutes}
          onValueChange={v => update({examTimer: v})}
        />
        <Divider />
        <ToggleRow
          title="End when result is decided"
          subtitle="Many DMV computers stop as soon as you have passed or failed"
          icon="flag"
          value={realisticExam}
          onValueChange={v => update({realisticExam: v})}
        />
      </Card>

      {attempts.length ? (
        <>
          <SectionHeader title="Recent attempts" actionLabel="History" onAction={() => navigation.navigate('ExamHistory')} />
          <Card padded={false} style={{paddingHorizontal: spacing.lg}}>
            {attempts.map((a, i) => (
              <React.Fragment key={a.id}>
                {i ? <Divider /> : null}
                <ListRow
                  title={`${a.correct}/${a.total} · ${Math.round((a.correct / Math.max(1, a.total)) * 100)}%`}
                  subtitle={`${new Date(a.at).toLocaleDateString()} · ${formatDuration(a.durationSec)}`}
                  icon={a.passed ? 'badge-check' : 'circle-x'}
                  iconColor={a.passed ? colors.success : colors.danger}
                  value={a.passed ? 'Passed' : 'Failed'}
                />
              </React.Fragment>
            ))}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

function Big({value, label}: {value: string; label: string}) {
  return (
    <View style={styles.big}>
      <Text variant="title">{value}</Text>
      <Text variant="caption" color="textMuted" align="center">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  wrap: {flexDirection: 'row', flexWrap: 'wrap'},
  big: {flex: 1, alignItems: 'center'},
  left: {alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 0},
});
