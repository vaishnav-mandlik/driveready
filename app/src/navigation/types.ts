import type {NavigatorScreenParams} from '@react-navigation/native';
import type {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {SignCategory, TopicId} from '../data/types';
import type {QuizSpec} from '../engine/quiz';

export type TabParamList = {
  Home: undefined;
  Practice: undefined;
  Signs: undefined;
  Learn: undefined;
  Progress: undefined;
};

export type RootStackParamList = {
  // onboarding
  Welcome: undefined;
  PickState: {mode: 'onboarding' | 'change'};
  PickTrack: {mode: 'onboarding' | 'change'};
  Goal: {mode: 'onboarding' | 'change'};
  // main
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Quiz: {spec: QuizSpec};
  Results: {sessionId: string; unlocked?: string[]; newBest?: boolean; previousBest?: number};
  Review: {sessionId: string; filter?: 'all' | 'wrong'};
  ExamIntro: {examId?: string};
  Topic: {topic: TopicId};
  SignDetail: {code: string};
  Flashcards: {category?: SignCategory | 'all'};
  Lesson: {lessonId: string};
  CheatSheet: undefined;
  FactCards: undefined;
  ExamInfo: undefined;
  Search: undefined;
  QuestionList: {kind: 'bookmarks' | 'mistakes'};
  QuestionDetail: {id: string};
  ExamHistory: undefined;
  Achievements: undefined;
  StudyPlan: undefined;
  DriveLog: undefined;
  DriveEntry: {id?: string};
  Settings: undefined;
  About: undefined;
  Sources: undefined;
  Privacy: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type RootNav = NativeStackNavigationProp<RootStackParamList>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
