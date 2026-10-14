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

import {AnyScreen, CASES} from '../utils/screenCases';
import {HomeScreen} from '../../src/screens/home/HomeScreen';
import {PracticeScreen} from '../../src/screens/practice/PracticeScreen';
import {LearnScreen} from '../../src/screens/learn/LearnScreen';
import {ProgressScreen} from '../../src/screens/progress/ProgressScreen';
import {CheatSheetScreen} from '../../src/screens/learn/CheatSheetScreen';
import {QuizScreen} from '../../src/screens/quiz/QuizScreen';
import {ResultsScreen} from '../../src/screens/quiz/ResultsScreen';
import {ReviewScreen} from '../../src/screens/quiz/ReviewScreen';
import {GoalScreen} from '../../src/screens/onboarding/GoalScreen';

beforeEach(() => {
  clearBankCache();
  useProgress.getState().resetProgress();
  setLearner();
});

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
