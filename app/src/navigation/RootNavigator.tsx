import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Icon, IconName} from '../components/Icon';
import {useSettings} from '../store/settings';
import {useTheme} from '../theme/ThemeProvider';
import type {RootStackParamList, TabParamList} from './types';

import {WelcomeScreen} from '../screens/onboarding/WelcomeScreen';
import {PickStateScreen} from '../screens/onboarding/PickStateScreen';
import {PickTrackScreen} from '../screens/onboarding/PickTrackScreen';
import {GoalScreen} from '../screens/onboarding/GoalScreen';
import {HomeScreen} from '../screens/home/HomeScreen';
import {StudyPlanScreen} from '../screens/home/StudyPlanScreen';
import {DriveLogScreen} from '../screens/drivelog/DriveLogScreen';
import {DriveEntryScreen} from '../screens/drivelog/DriveEntryScreen';
import {PracticeScreen} from '../screens/practice/PracticeScreen';
import {TopicScreen} from '../screens/practice/TopicScreen';
import {QuestionListScreen} from '../screens/practice/QuestionListScreen';
import {SearchScreen} from '../screens/practice/SearchScreen';
import {QuizScreen} from '../screens/quiz/QuizScreen';
import {ResultsScreen} from '../screens/quiz/ResultsScreen';
import {ReviewScreen} from '../screens/quiz/ReviewScreen';
import {ExamIntroScreen} from '../screens/quiz/ExamIntroScreen';
import {QuestionDetailScreen} from '../screens/quiz/QuestionDetailScreen';
import {SignsScreen} from '../screens/signs/SignsScreen';
import {SignDetailScreen} from '../screens/signs/SignDetailScreen';
import {FlashcardsScreen} from '../screens/signs/FlashcardsScreen';
import {LearnScreen} from '../screens/learn/LearnScreen';
import {LessonScreen} from '../screens/learn/LessonScreen';
import {CheatSheetScreen} from '../screens/learn/CheatSheetScreen';
import {ExamInfoScreen} from '../screens/learn/ExamInfoScreen';
import {ProgressScreen} from '../screens/progress/ProgressScreen';
import {ExamHistoryScreen} from '../screens/progress/ExamHistoryScreen';
import {AchievementsScreen} from '../screens/progress/AchievementsScreen';
import {SettingsScreen} from '../screens/settings/SettingsScreen';
import {AboutScreen} from '../screens/settings/AboutScreen';
import {SourcesScreen} from '../screens/settings/SourcesScreen';
import {PrivacyScreen} from '../screens/settings/PrivacyScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, IconName> = {
  Home: 'home',
  Practice: 'clipboard-check',
  Signs: 'signpost',
  Learn: 'book',
  Progress: 'chart',
};

function Tabs() {
  const {colors} = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {backgroundColor: colors.surface, borderTopColor: colors.border},
        tabBarLabelStyle: {fontSize: 11, fontWeight: '600'},
        tabBarIcon: ({color, size}) => <Icon name={TAB_ICONS[route.name]} size={size - 2} color={color} />,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Practice" component={PracticeScreen} />
      <Tab.Screen name="Signs" component={SignsScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const {colors} = useTheme();
  const onboarded = useSettings(s => s.onboarded);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.background},
        headerTintColor: colors.text,
        headerTitleStyle: {fontWeight: '700'},
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: {backgroundColor: colors.background},
        animation: 'slide_from_right',
      }}>
      {!onboarded ? (
        <Stack.Group screenOptions={{headerShown: false}}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="PickState" component={PickStateScreen} initialParams={{mode: 'onboarding'}} />
          <Stack.Screen name="PickTrack" component={PickTrackScreen} initialParams={{mode: 'onboarding'}} />
          <Stack.Screen name="Goal" component={GoalScreen} initialParams={{mode: 'onboarding'}} />
        </Stack.Group>
      ) : (
        <>
          <Stack.Screen name="Tabs" component={Tabs} options={{headerShown: false}} />
          <Stack.Group>
            <Stack.Screen name="Quiz" component={QuizScreen} options={{title: '', gestureEnabled: false}} />
            <Stack.Screen name="Results" component={ResultsScreen} options={{title: 'Results', headerBackVisible: false, gestureEnabled: false}} />
            <Stack.Screen name="Review" component={ReviewScreen} options={{title: 'Review Answers'}} />
            <Stack.Screen name="ExamIntro" component={ExamIntroScreen} options={{title: 'Exam Simulator'}} />
            <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} options={{title: 'Question'}} />
            <Stack.Screen name="Topic" component={TopicScreen} options={{title: ''}} />
            <Stack.Screen name="QuestionList" component={QuestionListScreen} options={{title: ''}} />
            <Stack.Screen name="Search" component={SearchScreen} options={{title: 'Search Questions'}} />
            <Stack.Screen name="StudyPlan" component={StudyPlanScreen} options={{title: 'Study Plan'}} />
            <Stack.Screen name="DriveLog" component={DriveLogScreen} options={{title: 'Driving Log'}} />
            <Stack.Screen name="DriveEntry" component={DriveEntryScreen} options={{title: 'Log a Drive', presentation: 'modal'}} />
            <Stack.Screen name="SignDetail" component={SignDetailScreen} options={{title: ''}} />
            <Stack.Screen name="Flashcards" component={FlashcardsScreen} options={{title: 'Sign Flashcards'}} />
            <Stack.Screen name="Lesson" component={LessonScreen} options={{title: ''}} />
            <Stack.Screen name="CheatSheet" component={CheatSheetScreen} options={{title: 'State Cheat Sheet'}} />
            <Stack.Screen name="ExamInfo" component={ExamInfoScreen} options={{title: 'About Your Test'}} />
            <Stack.Screen name="ExamHistory" component={ExamHistoryScreen} options={{title: 'Exam History'}} />
            <Stack.Screen name="Achievements" component={AchievementsScreen} options={{title: 'Achievements'}} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{title: 'Settings'}} />
            <Stack.Screen name="About" component={AboutScreen} options={{title: 'About'}} />
            <Stack.Screen name="Sources" component={SourcesScreen} options={{title: 'Official Sources'}} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} options={{title: 'Privacy Policy'}} />
            <Stack.Screen name="PickState" component={PickStateScreen} options={{title: 'Choose Your State'}} />
            <Stack.Screen name="PickTrack" component={PickTrackScreen} options={{title: 'Choose Your Test'}} />
            <Stack.Screen name="Goal" component={GoalScreen} options={{title: 'Goals & Test Date'}} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
}
