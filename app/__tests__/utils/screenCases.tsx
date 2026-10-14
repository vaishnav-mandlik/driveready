/**
 * Every screen with the params it needs and an English UI phrase it must show.
 * Shared by screens.test.tsx (English) and spanish.test.tsx (the phrase must be translated).
 * Test files must jest.mock('../../src/content', ...) with the fixtures before importing this.
 */
import React from 'react';
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


export type AnyScreen = React.ComponentType<any>;
export const CASES: [string, AnyScreen, object | undefined, RegExp][] = [
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

