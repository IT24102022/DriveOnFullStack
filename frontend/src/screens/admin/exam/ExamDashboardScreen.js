import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert,
  RefreshControl, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../theme';
import { 
  getUpcomingTheoryExams, 
  getUpcomingPracticalExams,
  getProgressStats,
  getStudentProgress,
  getStudentResults
} from '../../../services/examApi';
import { useAuth } from '../../../context/AuthContext';

const { width } = Dimensions.get('window');

const renderStatCard = (title, value, icon, color, subtitle = '') => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statIcon}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  </View>
);

export default function ExamDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [upcomingExams, setUpcomingExams] = useState({
    theory: [],
    practical: []
  });
  const [studentStatus, setStudentStatus] = useState(null);

  const loadData = useCallback(async () => {
    try {
      if (user.role === 'admin' || user.role === 'instructor') {
        const [theoryExamsData, practicalExamsData, statsData] = await Promise.all([
          getUpcomingTheoryExams(),
          getUpcomingPracticalExams(),
          getProgressStats()
        ]);
        
        setUpcomingExams({
          theory: theoryExamsData.data,
          practical: practicalExamsData.data
        });
        setStats(statsData.data);
      } else if (user.role === 'student') {
        const [theoryExamsData, practicalExamsData, progressData, resultsData] = await Promise.all([
          getUpcomingTheoryExams(),
          getUpcomingPracticalExams(),
          getStudentProgress(user.studentId),
          getStudentResults(user.studentId)
        ]);
        
        setUpcomingExams({
          theory: theoryExamsData.data,
          practical: practicalExamsData.data
        });
        setStudentStatus({
          progress: progressData.data,
          results: resultsData.data
        });
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      Alert.alert('Error', 'Could not load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.role, user.studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const renderStatCard = (title, value, icon, color, subtitle = '') => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const renderExamCard = (exam, type) => {
    const seatsUsed = exam.enrolledStudents?.length || 0;
    const seatsAvailable = exam.maxSeats - seatsUsed;
    const isFull = seatsAvailable === 0;
    const utilizationRate = Math.round((seatsUsed / exam.maxSeats) * 100);

    return (
      <TouchableOpacity
        key={exam._id}
        style={styles.examCard}
        onPress={() => navigation.navigate('ExamDetails', { examType: type, examId: exam._id })}
      >
        <View style={styles.examHeader}>
          <View style={styles.examInfo}>
            <Text style={styles.examTitle}>
              {type === 'theory' ? exam.examName : `${exam.vehicleCategory} Practical`}
            </Text>
            <Text style={styles.examDate}>
              {new Date(exam.date).toLocaleDateString()} • {exam.startTime}
            </Text>
          </View>
          <View style={[
            styles.seatBadge,
            { backgroundColor: isFull ? COLORS.red : COLORS.green }
          ]}>
            <Text style={styles.seatBadgeText}>
              {seatsUsed}/{exam.maxSeats}
            </Text>
          </View>
        </View>
        
        <View style={styles.examDetails}>
          <Text style={styles.examLocation}>
            {type === 'theory' ? exam.locationOrHall : exam.trialLocation}
          </Text>
          {type === 'theory' && exam.language && (
            <Text style={styles.examLanguage}>Language: {exam.language}</Text>
          )}
        </View>

        <View style={styles.examFooter}>
          <View style={styles.utilizationBar}>
            <View style={[
              styles.utilizationFill,
              { width: `${utilizationRate}%`, backgroundColor: isFull ? COLORS.red : COLORS.brandOrange }
            ]} />
          </View>
          <Text style={styles.utilizationText}>{utilizationRate}% full</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStudentStatus = () => {
    if (!studentStatus) return null;

    const { progress, results } = studentStatus;
    const isAssignedToTheory = progress.overallStatus === 'Assigned for Theory Exam';
    const isAssignedToPractical = progress.overallStatus === 'Assigned for Practical Exam';

    return (
      <View style={styles.studentStatusCard}>
        <Text style={styles.sectionTitle}>My Status</Text>
        
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Overall Progress</Text>
            <Text style={styles.statusValue}>{progress.overallStatus}</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Theory Status</Text>
            <Text style={styles.statusValue}>{progress.theoryExamStatus}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Practical Status</Text>
            <Text style={styles.statusValue}>{progress.practicalExamStatus}</Text>
          </View>
        </View>

        {(isAssignedToTheory || isAssignedToPractical) && (
          <View style={styles.assignmentAlert}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.brandOrange} />
            <Text style={styles.assignmentText}>
              You are assigned to {isAssignedToTheory ? 'Theory' : 'Practical'} exam
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.brandOrange} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Exam Dashboard</Text>
          {user.role === 'admin' && (
            <TouchableOpacity
              style={styles.importBtn}
              onPress={() => navigation.navigate('ExamImport')}
            >
              <Ionicons name="download-outline" size={20} color={COLORS.white} />
              <Text style={styles.importBtnText}>Import</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Admin/Instructor Stats */}
        {(user.role === 'admin' || user.role === 'instructor') && stats && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              {renderStatCard(
                'Upcoming Theory',
                upcomingExams.theory?.length || 0,
                'book-outline',
                COLORS.blue
              )}
              {renderStatCard(
                'Upcoming Practical',
                upcomingExams.practical?.length || 0,
                'car-outline',
                COLORS.green
              )}
              {renderStatCard(
                'Total Students',
                stats.totalStudents || 0,
                'people-outline',
                COLORS.purple
              )}
              {renderStatCard(
                'Theory Pass Rate',
                `${stats.theoryPassRate || 0}%`,
                'checkmark-circle-outline',
                COLORS.brandOrange
              )}
            </View>
          </View>
        )}

        {/* Student Status */}
        {user.role === 'student' && renderStudentStatus()}

        {/* Upcoming Theory Exams */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Theory Exams</Text>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => navigation.navigate('TheoryExamList')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {upcomingExams.theory?.length > 0 ? (
            upcomingExams.theory.slice(0, 3).map(exam => renderExamCard(exam, 'theory'))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No upcoming theory exams</Text>
            </View>
          )}
        </View>

        {/* Upcoming Practical Exams */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Practical Exams</Text>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => navigation.navigate('PracticalExamList')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {upcomingExams.practical?.length > 0 ? (
            upcomingExams.practical.slice(0, 3).map(exam => renderExamCard(exam, 'practical'))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No upcoming practical exams</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  title: { fontSize: 24, fontWeight: '600', color: COLORS.black },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandOrange,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  importBtnText: { color: COLORS.white, fontWeight: '500', marginLeft: 4 },
  statsSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.black, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: (width - 56) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  statIcon: { marginBottom: 8 },
  statContent: {},
  statValue: { fontSize: 24, fontWeight: '700', color: COLORS.black },
  statTitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  statSubtitle: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  section: { padding: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  viewAllBtn: {},
  viewAllText: { color: COLORS.brandOrange, fontWeight: '500' },
  examCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  examInfo: { flex: 1 },
  examTitle: { fontSize: 16, fontWeight: '600', color: COLORS.black },
  examDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  seatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  seatBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  examDetails: { marginBottom: 12 },
  examLocation: { fontSize: 14, color: COLORS.textMuted },
  examLanguage: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  examFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  utilizationBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.bgLight,
    borderRadius: 2,
    marginRight: 12
  },
  utilizationFill: { height: '100%', borderRadius: 2 },
  utilizationText: { fontSize: 12, color: COLORS.textMuted },
  studentStatusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  statusItem: { flex: 1 },
  statusLabel: { fontSize: 12, color: COLORS.textMuted },
  statusValue: { fontSize: 14, fontWeight: '600', color: COLORS.black, marginTop: 4 },
  assignmentAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8ED',
    padding: 12,
    borderRadius: 8,
    marginTop: 8
  },
  assignmentText: { fontSize: 14, color: COLORS.brandOrange, marginLeft: 8 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32
  },
  emptyText: { fontSize: 14, color: COLORS.textMuted, marginTop: 8 }
});
