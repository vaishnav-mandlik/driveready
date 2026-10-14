import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Icon, IconName} from '../components/Icon';
import {defineStrings, useStrings} from '../i18n';
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
import {FactCardsScreen} from '../screens/learn/FactCardsScreen';
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

const STR = defineStrings(
  {
    tabs: {Home: 'Home', Practice: 'Practice', Signs: 'Signs', Learn: 'Learn', Progress: 'Progress'} as Record<keyof TabParamList, string>,
    results: 'Results',
    review: 'Review Answers',
    examSimulator: 'Exam Simulator',
    question: 'Question',
    search: 'Search Questions',
    studyPlan: 'Study Plan',
    driveLog: 'Driving Log',
    logDrive: 'Log a Drive',
    flashcards: 'Sign Flashcards',
    cheatSheet: 'State Cheat Sheet',
    factCards: 'Numbers to Know',
    examInfo: 'About Your Test',
    examHistory: 'Exam History',
    achievements: 'Achievements',
    settings: 'Settings',
    about: 'About',
    sources: 'Official Sources',
    privacy: 'Privacy Policy',
    pickState: 'Choose Your State',
    pickTrack: 'Choose Your Test',
    goal: 'Goals & Test Date',
  },
  {
    tabs: {Home: 'Inicio', Practice: 'Práctica', Signs: 'Señales', Learn: 'Aprender', Progress: 'Progreso'} as Record<keyof TabParamList, string>,
    results: 'Resultados',
    review: 'Revisar respuestas',
    examSimulator: 'Simulador de examen',
    question: 'Pregunta',
    search: 'Buscar preguntas',
    studyPlan: 'Plan de estudio',
    driveLog: 'Registro de manejo',
    logDrive: 'Registrar práctica',
    flashcards: 'Tarjetas de señales',
    cheatSheet: 'Hoja de repaso del estado',
    factCards: 'Cifras clave',
    examInfo: 'Sobre tu examen',
    examHistory: 'Historial de exámenes',
    achievements: 'Logros',
    settings: 'Ajustes',
    about: 'Acerca de',
    sources: 'Fuentes oficiales',
    privacy: 'Política de privacidad',
    pickState: 'Elige tu estado',
    pickTrack: 'Elige tu examen',
    goal: 'Metas y fecha del examen',
  },
);

function Tabs() {
  const {colors} = useTheme();
  const t = useStrings(STR);
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        title: t.tabs[route.name],
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
  const t = useStrings(STR);

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
        // navigationKey: PickState/PickTrack/Goal exist in both branches; keying the groups makes
        // React Navigation drop the onboarding routes when onboarding completes (instead of keeping them).
        <Stack.Group navigationKey="onboarding" screenOptions={{headerShown: false}}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="PickState" component={PickStateScreen} initialParams={{mode: 'onboarding'}} />
          <Stack.Screen name="PickTrack" component={PickTrackScreen} initialParams={{mode: 'onboarding'}} />
          <Stack.Screen name="Goal" component={GoalScreen} initialParams={{mode: 'onboarding'}} />
        </Stack.Group>
      ) : (
        <Stack.Group navigationKey="main">
          <Stack.Screen name="Tabs" component={Tabs} options={{headerShown: false}} />
          <Stack.Group>
            <Stack.Screen name="Quiz" component={QuizScreen} options={{title: '', gestureEnabled: false}} />
            <Stack.Screen name="Results" component={ResultsScreen} options={{title: t.results, headerBackVisible: false, gestureEnabled: false}} />
            <Stack.Screen name="Review" component={ReviewScreen} options={{title: t.review}} />
            <Stack.Screen name="ExamIntro" component={ExamIntroScreen} options={{title: t.examSimulator}} />
            <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} options={{title: t.question}} />
            <Stack.Screen name="Topic" component={TopicScreen} options={{title: ''}} />
            <Stack.Screen name="QuestionList" component={QuestionListScreen} options={{title: ''}} />
            <Stack.Screen name="Search" component={SearchScreen} options={{title: t.search}} />
            <Stack.Screen name="StudyPlan" component={StudyPlanScreen} options={{title: t.studyPlan}} />
            <Stack.Screen name="DriveLog" component={DriveLogScreen} options={{title: t.driveLog}} />
            <Stack.Screen name="DriveEntry" component={DriveEntryScreen} options={{title: t.logDrive, presentation: 'modal'}} />
            <Stack.Screen name="SignDetail" component={SignDetailScreen} options={{title: ''}} />
            <Stack.Screen name="Flashcards" component={FlashcardsScreen} options={{title: t.flashcards}} />
            <Stack.Screen name="Lesson" component={LessonScreen} options={{title: ''}} />
            <Stack.Screen name="CheatSheet" component={CheatSheetScreen} options={{title: t.cheatSheet}} />
            <Stack.Screen name="FactCards" component={FactCardsScreen} options={{title: t.factCards}} />
            <Stack.Screen name="ExamInfo" component={ExamInfoScreen} options={{title: t.examInfo}} />
            <Stack.Screen name="ExamHistory" component={ExamHistoryScreen} options={{title: t.examHistory}} />
            <Stack.Screen name="Achievements" component={AchievementsScreen} options={{title: t.achievements}} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{title: t.settings}} />
            <Stack.Screen name="About" component={AboutScreen} options={{title: t.about}} />
            <Stack.Screen name="Sources" component={SourcesScreen} options={{title: t.sources}} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} options={{title: t.privacy}} />
            <Stack.Screen name="PickState" component={PickStateScreen} options={{title: t.pickState}} />
            <Stack.Screen name="PickTrack" component={PickTrackScreen} options={{title: t.pickTrack}} />
            <Stack.Screen name="Goal" component={GoalScreen} options={{title: t.goal}} />
          </Stack.Group>
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
