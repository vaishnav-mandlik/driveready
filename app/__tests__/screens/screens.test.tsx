import React from 'react';
import {act, configure, fireEvent, screen} from '@testing-library/react-native';
import {mockNav, renderInStack, renderWithProviders, setLearner} from '../utils/render';
import {useProgress} from '../../src/store/progress';
import {useSessions} from '../../src/store/session';
import {startSession, finishSession} from '../../src/store/actions';
import {clearBankCache} from '../../src/data/bank';

jest.mock('../../src/content', () => require('../fixtures/content'));

// Generous async timeouts: these flows run many interactions and CI/dev machines can be busy.
configure({asyncUtilTimeout: 5000});
jest.setTimeout(60000);

import {WelcomeScreen} from '../../src/screens/onboarding/WelcomeScreen';
import {PickStateScreen} from '../../src/screens/onboarding/PickStateScreen';
import {PickTrackScreen} from '../../src/screens/onboarding/PickTrackScreen';
import {GoalScreen} from '../../src/screens/onboarding/GoalScreen';
import {HomeScreen} from '../../src/screens/home/HomeScreen';
import {StudyPlanScreen} from '../../src/screens/home/StudyPlanScreen';
import {PracticeScreen} from '../../src/screens/practice/PracticeScreen';
import {TopicScreen} from '../../src/screens/practice/TopicScreen';
import {QuestionListScreen} from '../../src/screens/practice/QuestionListScreen';
import {SearchScreen} from '../../src/screens/practice/SearchScreen';
import {QuizScreen} from '../../src/screens/quiz/QuizScreen';
import {ResultsScreen} from '../../src/screens/quiz/ResultsScreen';
import {ReviewScreen} from '../../src/screens/quiz/ReviewScreen';
import {ExamIntroScreen} from '../../src/screens/quiz/ExamIntroScreen';
import {QuestionDetailScreen} from '../../src/screens/quiz/QuestionDetailScreen';
import {SignsScreen} from '../../src/screens/signs/SignsScreen';
import {SignDetailScreen} from '../../src/screens/signs/SignDetailScreen';
import {FlashcardsScreen} from '../../src/screens/signs/FlashcardsScreen';
import {LearnScreen} from '../../src/screens/learn/LearnScreen';
import {LessonScreen} from '../../src/screens/learn/LessonScreen';
import {CheatSheetScreen} from '../../src/screens/learn/CheatSheetScreen';
import {FactCardsScreen} from '../../src/screens/learn/FactCardsScreen';
import {ExamInfoScreen} from '../../src/screens/learn/ExamInfoScreen';
import {ProgressScreen} from '../../src/screens/progress/ProgressScreen';
import {ExamHistoryScreen} from '../../src/screens/progress/ExamHistoryScreen';
import {AchievementsScreen} from '../../src/screens/progress/AchievementsScreen';
import {DriveLogScreen} from '../../src/screens/drivelog/DriveLogScreen';
import {DriveEntryScreen} from '../../src/screens/drivelog/DriveEntryScreen';
import {SettingsScreen} from '../../src/screens/settings/SettingsScreen';
import {AboutScreen} from '../../src/screens/settings/AboutScreen';
import {SourcesScreen} from '../../src/screens/settings/SourcesScreen';
import {PrivacyScreen} from '../../src/screens/settings/PrivacyScreen';

beforeEach(() => {
  clearBankCache();
  useProgress.getState().resetProgress();
  setLearner();
});

type AnyScreen = React.ComponentType<any>;
const CASES: [string, AnyScreen, object | undefined, RegExp][] = [
  ['Welcome', WelcomeScreen, undefined, /Welcome to DriveReady/],
  ['PickState', PickStateScreen, {mode: 'onboarding'}, /Which state/],
  ['PickTrack', PickTrackScreen, {mode: 'onboarding'}, /What are you studying for/],
  ['Goal', GoalScreen, {mode: 'onboarding'}, /Set your goal/],
  ['Home', HomeScreen, undefined, /Take a practice exam/],
  ['StudyPlan', StudyPlanScreen, undefined, /2-week plan/],
  ['Practice', PracticeScreen, undefined, /Practice test/],
  ['Topic', TopicScreen, {topic: 'right-of-way'}, /Practice 2 questions/],
  ['QuestionList mistakes', QuestionListScreen, {kind: 'mistakes'}, /No mistakes to fix/],
  ['QuestionList bookmarks', QuestionListScreen, {kind: 'bookmarks'}, /No saved questions/],
  ['Search', SearchScreen, undefined, /Search every question/],
  ['ExamIntro', ExamIntroScreen, {}, /California Knowledge Test/],
  ['QuestionDetail', QuestionDetailScreen, {id: 't.car.row.1'}, /Show answer/],
  ['Signs', SignsScreen, undefined, /Road Signs/],
  ['SignDetail', SignDetailScreen, {code: 'R1-1'}, /What it means/],
  ['Flashcards', FlashcardsScreen, {category: 'all'}, /Tap to flip/],
  ['Learn', LearnScreen, undefined, /cheat sheet/i],
  ['Lesson', LessonScreen, {lessonId: 't.lesson.signs'}, /Key points/],
  ['CheatSheet', CheatSheetScreen, undefined, /Verified against the official handbook/],
  ['FactCards', FactCardsScreen, undefined, /Tap to flip/],
  ['ExamInfo', ExamInfoScreen, undefined, /Test format/],
  ['Progress', ProgressScreen, undefined, /Topic mastery/],
  ['ExamHistory', ExamHistoryScreen, undefined, /No exams yet/],
  ['Achievements', AchievementsScreen, undefined, /unlocked/],
  ['DriveLog', DriveLogScreen, undefined, /No drives yet/],
  ['DriveEntry', DriveEntryScreen, {}, /Save drive/],
  ['Settings', SettingsScreen, undefined, /Reset study progress/],
  ['About', AboutScreen, undefined, /Every feature free/],
  ['Sources', SourcesScreen, undefined, /Not a government app/],
  ['Privacy', PrivacyScreen, undefined, /The short version/],
];

describe('every screen renders with content', () => {
  test.each(CASES)('%s', async (_name, Screen, params, expected) => {
    const props = mockNav(params);
    await renderWithProviders(<Screen {...props} />);
    expect((await screen.findAllByText(expected)).length).toBeGreaterThan(0);
  });
});

describe('screens survive an empty question bank', () => {
  test.each([
    ['Home', HomeScreen, undefined],
    ['Practice', PracticeScreen, undefined],
    ['Learn', LearnScreen, undefined],
    ['Progress', ProgressScreen, undefined],
    ['CheatSheet', CheatSheetScreen, undefined],
  ] as [string, AnyScreen, object | undefined][])('%s (Wyoming, no content)', async (_n, Screen, params) => {
    setLearner({state: 'WY'});
    const props = mockNav(params);
    await renderWithProviders(<Screen {...props} />);
    expect(screen.toJSON()).toBeTruthy();
  });
});

/** Fixture questions: "Correct choice" is right, except the True/False item where "False" is right. */
async function pressAnswer(correct: boolean) {
  await screen.findAllByTestId(/^choice-/);
  const tf = screen.queryByText('True');
  const label = tf ? (correct ? 'False' : 'True') : correct ? 'Correct choice' : 'Wrong choice one';
  await fireEvent.press(screen.getByText(label));
}

describe('quiz flow', () => {
  const quizStack = (spec: object) => [
    {name: 'Quiz', component: QuizScreen, params: {spec}},
    {name: 'Results', component: ResultsScreen},
    {name: 'Review', component: ReviewScreen},
    {name: 'Tabs', component: HomeScreen},
  ];

  test('empty bank shows a friendly empty state', async () => {
    setLearner({state: 'WY', track: 'cdl'});
    await renderInStack(quizStack({mode: 'mistakes'}));
    expect(await screen.findByText('No questions here yet')).toBeTruthy();
  });

  test('practice: answering reveals feedback, records progress, ends on results', async () => {
    await renderInStack(quizStack({mode: 'custom', questionIds: ['t.car.row.1', 't.car.park.1']}));
    // fixture: the correct answer is always "Correct choice"
    await fireEvent.press(await screen.findByText('Correct choice'));
    expect(await screen.findByTestId('explanation-card')).toBeTruthy();
    expect(useProgress.getState().totalAnswered).toBe(1);
    expect(useProgress.getState().stats['t.car.row.1'].c).toBe(1);
    await fireEvent.press(screen.getByTestId('quiz-next'));
    await fireEvent.press(await screen.findByText('Wrong choice one'));
    expect(useProgress.getState().stats['t.car.park.1'].w).toBe(1);
    await fireEvent.press(screen.getByTestId('quiz-next'));
    expect(await screen.findByTestId('results-headline')).toBeTruthy();
    expect(screen.getByText('1 of 2 answered correctly')).toBeTruthy();
  });

  test('exam: answers are recorded only on submit and results show pass', async () => {
    await renderInStack(quizStack({mode: 'exam'}));
    for (let i = 0; i < 10; i++) {
      await pressAnswer(true);
      expect(useProgress.getState().totalAnswered).toBe(0);
      if (i < 9) {
        await fireEvent.press(screen.getByTestId('quiz-next'));
      }
    }
    await fireEvent.press(screen.getByTestId('quiz-submit'));
    expect(await screen.findByText('You passed!')).toBeTruthy();
    expect(useProgress.getState().totalAnswered).toBe(10);
    expect(useProgress.getState().exams[0]).toMatchObject({passed: true, correct: 10, total: 10});
  });

  test('survival ends after three wrong answers', async () => {
    await renderInStack(quizStack({mode: 'survival'}));
    for (let i = 0; i < 3; i++) {
      await pressAnswer(false);
      if (i < 2) {
        await fireEvent.press(screen.getByTestId('quiz-next'));
      }
    }
    expect(await screen.findByText(/Out of lives/)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('quiz-next'));
    expect(await screen.findByTestId('results-headline')).toBeTruthy();
  });

  test('review lists answered questions with verdicts', async () => {
    const session = startSession({mode: 'custom', questionIds: ['t.car.row.1', 't.car.park.1']});
    session.answers = [0, 1];
    const done = finishSession(session);
    expect(useSessions.getState().sessions[done.session.id]).toBeTruthy();
    const props = mockNav({sessionId: done.session.id});
    await renderWithProviders(<ReviewScreen {...props} />);
    expect(await screen.findByText('Wrong 1')).toBeTruthy();
    await fireEvent.press(screen.getByText('Wrong 1'));
    expect(screen.queryAllByText('Correct').length).toBe(0);
  });
});

test('onboarding goal screen completes onboarding', async () => {
  const {useSettings} = require('../../src/store/settings');
  useSettings.setState({onboarded: false});
  const props = mockNav({mode: 'onboarding'});
  await renderWithProviders(<GoalScreen {...props} />);
  await act(async () => {
    await fireEvent.press(screen.getByTestId('goal-save'));
  });
  expect(useSettings.getState().onboarded).toBe(true);
});
