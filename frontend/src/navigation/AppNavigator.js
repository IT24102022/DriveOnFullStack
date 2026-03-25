import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';

import LoginScreen          from '../screens/auth/LoginScreen';
import AdminHomeScreen      from '../screens/AdminHomeScreen';
import StudentHomeScreen    from '../screens/StudentHomeScreen';
import InstructorHomeScreen from '../screens/InstructorHomeScreen';
import SessionsScreen       from '../screens/sessions/SessionsScreen';
import LearningScreen       from '../screens/learning/LearningScreen';
import QuizScreen           from '../screens/learning/QuizScreen';
import PaymentsScreen       from '../screens/payments/PaymentsScreen';
import AddPaymentScreen     from '../screens/payments/AddPaymentScreen';
import AccountScreen        from '../screens/AccountScreen';
import BookSessionScreen    from '../screens/sessions/BookSessionScreen';

import StudentListScreen     from '../screens/admin/StudentListScreen';
import AddEditStudentScreen  from '../screens/admin/AddEditStudentScreen';
import MonthlyReportScreen   from '../screens/admin/MonthlyReportScreen';
import StudentDashboard      from '../screens/student/StudentDashboardScreen';

import InstructorListScreen    from '../screens/admin/InstructorListScreen';
import AddEditInstructorScreen from '../screens/admin/AddEditInstructorScreen';
import VehicleListScreen       from '../screens/admin/VehicleListScreen';
import VehicleDetailScreen     from '../screens/admin/VehicleDetailScreen';
import AddEditVehicleScreen   from '../screens/admin/AddEditVehicleScreen';
import AddEditOwnerScreen     from '../screens/admin/AddEditOwnerScreen';
import OwnersListScreen       from '../screens/admin/OwnersListScreen';
import VehicleUsageReportScreen from '../screens/admin/VehicleUsageReportScreen';
import ExpiryAlertsScreen    from '../screens/admin/ExpiryAlertsScreen';

// Exam System Imports
import ExamDashboardScreen      from '../screens/admin/exam/ExamDashboardScreen';
import TheoryExamListScreen     from '../screens/admin/exam/TheoryExamListScreen';
import PracticalExamListScreen  from '../screens/admin/exam/PracticalExamListScreen';
import ExamDetailsScreen        from '../screens/admin/exam/ExamDetailsScreen';
import ProgressTrackingScreen   from '../screens/admin/exam/ProgressTrackingScreen';

import AdminSessionListScreen from '../screens/admin/AdminSessionListScreen';
import AddEditSessionScreen   from '../screens/admin/AddEditSessionScreen';
import SessionReportScreen    from '../screens/admin/SessionReportScreen';
import FeedbackScreen         from '../screens/student/FeedbackScreen';

import SessionEnrollmentScreen   from '../screens/admin/SessionEnrollmentScreen';
import TakeAttendanceScreen      from '../screens/admin/TakeAttendanceScreen';
import AttendanceAnalyticsScreen from '../screens/admin/AttendanceAnalyticsScreen';
import StudentProgressScreen     from '../screens/admin/StudentProgressScreen';
import AvailableSessionsScreen   from '../screens/student/AvailableSessionsScreen';

import LearningCatalogScreen from '../screens/student/learning/LearningCatalogScreen';
import StudentLearningScreen from '../screens/student/learning/StudentLearningScreen';
import LessonDetailScreen from '../screens/student/learning/LessonDetailScreen';
import ResourceDetailScreen from '../screens/student/learning/ResourceDetailScreen';
import LessonScreen          from '../screens/student/learning/LessonScreen';
import QuizTakeScreen        from '../screens/student/learning/QuizTakeScreen';
import QuizResultScreen      from '../screens/student/learning/QuizResultScreen';

import AdminTopicsScreen        from '../screens/admin/learning/AdminTopicsScreen';
import AdminLessonsScreen       from '../screens/admin/learning/AdminLessonsScreen';
import AdminLessonDetailScreen  from '../screens/admin/learning/AdminLessonDetailScreen';
import AdminQuizBuilderScreen   from '../screens/admin/learning/AdminQuizBuilderScreen';
import AdminQuizAnalyticsScreen from '../screens/admin/learning/AdminQuizAnalyticsScreen';
import CreateLearningContentScreen from '../screens/admin/learning/CreateLearningContentScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabBar({ icons, iconsActive, state, navigation }) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        return (
          <TouchableOpacity key={route.key} style={styles.tabItem} onPress={() => { if (!isFocused) navigation.navigate(route.name); }}>
            <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
              <Ionicons name={isFocused ? iconsActive[index] : icons[index]} size={22} color={isFocused ? COLORS.black : 'rgba(0,0,0,0.4)'} />
            </View>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{route.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar icons={['home-outline','people-outline','calendar-outline','card-outline','person-outline']} iconsActive={['home','people','calendar','card','person']} {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"     component={AdminHomeScreen} />
      <Tab.Screen name="Students" component={StudentListScreen} />
      <Tab.Screen name="Sessions" component={AdminSessionListScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Account"  component={AccountScreen} />
    </Tab.Navigator>
  );
}

function StudentTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar icons={['home-outline','school-outline','card-outline','person-outline']} iconsActive={['home','school','card','person']} {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"     component={StudentHomeScreen} />
      <Tab.Screen name="Learning" component={StudentLearningScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Account"  component={AccountScreen} />
    </Tab.Navigator>
  );
}

function InstructorTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar icons={['home-outline','calendar-outline','person-outline']} iconsActive={['home','calendar','person']} {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"     component={InstructorHomeScreen} />
      <Tab.Screen name="Sessions" component={SessionsScreen} />
      <Tab.Screen name="Account"  component={AccountScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.brandOrange} /></View>;
  }

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  if (user.role === 'admin') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminMain"         component={AdminTabs} />
        <Stack.Screen name="StudentList"       component={StudentListScreen} />
        <Stack.Screen name="AddStudent"        component={AddEditStudentScreen} />
        <Stack.Screen name="EditStudent"       component={AddEditStudentScreen} />
        <Stack.Screen name="StudentDetail"     component={StudentDashboard} />
        <Stack.Screen name="MonthlyReport"     component={MonthlyReportScreen} />
        <Stack.Screen name="InstructorList"    component={InstructorListScreen} />
        <Stack.Screen name="AddEditInstructor" component={AddEditInstructorScreen} />
        <Stack.Screen name="InstructorDetail"  component={AddEditInstructorScreen} />
        <Stack.Screen name="VehicleList"       component={VehicleListScreen} />
        <Stack.Screen name="VehicleDetail"      component={VehicleDetailScreen} />
        <Stack.Screen name="AddEditVehicle"    component={AddEditVehicleScreen} />
        <Stack.Screen name="AddEditOwner"      component={AddEditOwnerScreen} />
        <Stack.Screen name="OwnersList"        component={OwnersListScreen} />
        <Stack.Screen name="VehicleUsageReport" component={VehicleUsageReportScreen} />
        <Stack.Screen name="ExpiryAlerts"      component={ExpiryAlertsScreen} />
        <Stack.Screen name="AdminSessions"     component={AdminSessionListScreen} />
        <Stack.Screen name="AddEditSession"    component={AddEditSessionScreen} />
        <Stack.Screen name="SessionDetail"     component={AddEditSessionScreen} />
        <Stack.Screen name="SessionReport"     component={SessionReportScreen} />
        <Stack.Screen name="AddPayment"        component={AddPaymentScreen} />
        <Stack.Screen name="SessionEnrollment"     component={SessionEnrollmentScreen} />
<Stack.Screen name="TakeAttendance"        component={TakeAttendanceScreen} />
<Stack.Screen name="AttendanceAnalytics"   component={AttendanceAnalyticsScreen} />
<Stack.Screen name="StudentProgress"       component={StudentProgressScreen} />
        <Stack.Screen name="AdminTopics"           component={AdminTopicsScreen} />
        <Stack.Screen name="AdminLessons"          component={AdminLessonsScreen} />
        <Stack.Screen name="AdminLessonDetail"     component={AdminLessonDetailScreen} />
        <Stack.Screen name="AdminQuizBuilder"      component={AdminQuizBuilderScreen} />
        <Stack.Screen name="AdminQuizAnalytics"    component={AdminQuizAnalyticsScreen} />
        <Stack.Screen name="CreateLearningContent" component={CreateLearningContentScreen} />
        
        {/* Exam System Routes */}
        <Stack.Screen name="ExamDashboard"      component={ExamDashboardScreen} />
        <Stack.Screen name="TheoryExamList"     component={TheoryExamListScreen} />
        <Stack.Screen name="PracticalExamList"  component={PracticalExamListScreen} />
        <Stack.Screen name="ExamDetails"        component={ExamDetailsScreen} />
        <Stack.Screen name="ProgressTracking"   component={ProgressTrackingScreen} />
      </Stack.Navigator>
    );
  }

  if (user.role === 'student') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="StudentMain" component={StudentTabs} />
        <Stack.Screen name="Quiz"        component={QuizScreen} />
        <Stack.Screen name="LessonDetail"        component={LessonDetailScreen} />
        <Stack.Screen name="ResourceDetail"      component={ResourceDetailScreen} />
        <Stack.Screen name="Lesson"              component={LessonScreen} />
        <Stack.Screen name="LearningQuizTake"    component={QuizTakeScreen} />
        <Stack.Screen name="LearningQuizResult"  component={QuizResultScreen} />
        <Stack.Screen name="Feedback"    component={FeedbackScreen} />
        <Stack.Screen name="AddPayment"  component={AddPaymentScreen} />
        <Stack.Screen name="BookSession" component={BookSessionScreen} />
        <Stack.Screen name="AvailableSessions" component={AvailableSessionsScreen} />
      </Stack.Navigator>
    );
  }

  if (user.role === 'instructor') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="InstructorMain" component={InstructorTabs} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar:         { backgroundColor: COLORS.brandYellow, borderTopLeftRadius: 24, borderTopRightRadius: 24, flexDirection: 'row', paddingTop: 8, paddingBottom: 20, paddingHorizontal: 4 },
  tabItem:        { flex: 1, alignItems: 'center', gap: 2 },
  iconWrap:       { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: COLORS.white },
  tabLabel:       { fontSize: 10, fontWeight: '500', color: 'rgba(0,0,0,0.4)' },
  tabLabelActive: { color: COLORS.black, fontWeight: '600' },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
