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
  getAllStudentProgress,
  getProgressStats,
  getStudentProgress
} from '../../../services/examApi';
import { useAuth } from '../../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function ProgressTrackingScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);

  const loadData = useCallback(async () => {
    try {
      if (user.role === 'student') {
        const response = await getStudentProgress(user.studentId);
        setStudentDetails(response.data);
      } else {
        const [studentsResponse, statsResponse] = await Promise.all([
          getAllStudentProgress(),
          getProgressStats()
        ]);
        
        setStudents(studentsResponse.data.progress);
        setStats(statsResponse.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not load progress data');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return COLORS.green;
      case 'Practical Passed': return COLORS.blue;
      case 'Theory Passed': return COLORS.brandOrange;
      case 'Assigned for Practical Exam': return COLORS.purple;
      case 'Assigned for Theory Exam': return COLORS.purple;
      case 'In Progress': return COLORS.blueBg;
      case 'Not Started': return COLORS.textMuted;
      default: return COLORS.textMuted;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return 'checkmark-circle';
      case 'Practical Passed': return 'car';
      case 'Theory Passed': return 'book';
      case 'Assigned for Practical Exam': return 'calendar';
      case 'Assigned for Theory Exam': return 'calendar';
      case 'In Progress': return 'time';
      case 'Not Started': return 'radio-button-off';
      default: return 'radio-button-off';
    }
  };

  const renderStatCard = (title, value, subtitle, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderProgressBar = (progress, maxValue, color) => (
    <View style={styles.progressBar}>
      <View style={[
        styles.progressFill,
        { width: `${(progress / maxValue) * 100}%`, backgroundColor: color }
      ]} />
    </View>
  );

  const renderStudentCard = (student) => (
    <TouchableOpacity
      key={student._id}
      style={styles.studentCard}
      onPress={() => {
        setSelectedStudent(student);
        setShowStudentDetails(true);
      }}
    >
      <View style={styles.studentHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {student.student?.firstName} {student.student?.lastName}
          </Text>
          <Text style={styles.studentEmail}>{student.student?.email}</Text>
          <Text style={styles.studentContact}>{student.student?.contactNo}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(student.overallStatus) }]}>
          <Ionicons name={getStatusIcon(student.overallStatus)} size={16} color={COLORS.white} />
          <Text style={styles.statusText}>{student.overallStatus}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Theory</Text>
            <Text style={styles.progressValue}>{student.theoryExamStatus}</Text>
          </View>
          {renderProgressBar(
            student.theoryExamAttempts,
            Math.max(student.theoryExamAttempts, 1),
            student.theoryExamStatus === 'Passed' ? COLORS.green : COLORS.brandOrange
          )}
          <Text style={styles.progressAttempts}>
            {student.theoryExamAttempts} attempt{student.theoryExamAttempts !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Practical</Text>
            <Text style={styles.progressValue}>{student.practicalExamStatus}</Text>
          </View>
          {renderProgressBar(
            student.practicalExamAttempts,
            Math.max(student.practicalExamAttempts, 1),
            student.practicalExamStatus === 'Passed' ? COLORS.green : COLORS.blue
          )}
          <Text style={styles.progressAttempts}>
            {student.practicalExamAttempts} attempt{student.practicalExamAttempts !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.attendanceSection}>
        <View style={styles.attendanceItem}>
          <Ionicons name="book-outline" size={16} color={COLORS.brandOrange} />
          <Text style={styles.attendanceLabel}>Theory Attendance</Text>
          <Text style={styles.attendanceValue}>{student.theoryAttendanceRate}%</Text>
        </View>
        <View style={styles.attendanceItem}>
          <Ionicons name="car-outline" size={16} color={COLORS.blue} />
          <Text style={styles.attendanceLabel}>Practical Attendance</Text>
          <Text style={styles.attendanceValue}>{student.practicalAttendanceRate}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStudentDetails = () => {
    if (!studentDetails) return null;

    const { progress, theoryResults, practicalResults, attendanceStats } = studentDetails;

    return (
      <ScrollView style={styles.detailsContainer}>
        {/* Student Info */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Student Information</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Name</Text>
            <Text style={styles.detailsValue}>
              {progress.student?.firstName} {progress.student?.lastName}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Email</Text>
            <Text style={styles.detailsValue}>{progress.student?.email}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Contact</Text>
            <Text style={styles.detailsValue}>{progress.student?.contactNo}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Overall Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(progress.overallStatus) }]}>
              <Text style={styles.statusText}>{progress.overallStatus}</Text>
            </View>
          </View>
        </View>

        {/* Exam History */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Exam History</Text>
          
          <View style={styles.examHistorySection}>
            <Text style={styles.examHistoryTitle}>Theory Exams</Text>
            {theoryResults.length > 0 ? (
              theoryResults.map((result, index) => (
                <View key={index} style={styles.examResultItem}>
                  <View style={styles.examResultHeader}>
                    <Text style={styles.examResultName}>{result.theoryExam?.examName}</Text>
                    <View style={[
                      styles.resultBadge,
                      { backgroundColor: result.status === 'Pass' ? COLORS.green : COLORS.red }
                    ]}>
                      <Text style={styles.resultBadgeText}>{result.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.examResultDate}>
                    {new Date(result.recordedDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.examResultAttempt}>Attempt #{result.attemptNumber}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noResultsText}>No theory exam attempts</Text>
            )}
          </View>

          <View style={styles.examHistorySection}>
            <Text style={styles.examHistoryTitle}>Practical Exams</Text>
            {practicalResults.length > 0 ? (
              practicalResults.map((result, index) => (
                <View key={index} style={styles.examResultItem}>
                  <View style={styles.examResultHeader}>
                    <Text style={styles.examResultName}>
                      {result.practicalExam?.vehicleCategory} Practical
                    </Text>
                    <View style={[
                      styles.resultBadge,
                      { backgroundColor: result.status === 'Pass' ? COLORS.green : COLORS.red }
                    ]}>
                      <Text style={styles.resultBadgeText}>{result.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.examResultDate}>
                    {new Date(result.recordedDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.examResultAttempt}>Attempt #{result.attemptNumber}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noResultsText}>No practical exam attempts</Text>
            )}
          </View>
        </View>

        {/* Attendance Summary */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Attendance Summary</Text>
          
          <View style={styles.attendanceSummary}>
            <View style={styles.attendanceSummaryItem}>
              <Text style={styles.attendanceSummaryLabel}>Theory Sessions</Text>
              <Text style={styles.attendanceSummaryValue}>
                {attendanceStats.theory.presentSessions}/{attendanceStats.theory.totalSessions}
              </Text>
              <Text style={styles.attendanceSummaryRate}>
                {attendanceStats.theory.attendanceRate}% attendance
              </Text>
              {renderProgressBar(
                attendanceStats.theory.presentSessions,
                attendanceStats.theory.totalSessions,
                COLORS.brandOrange
              )}
            </View>

            <View style={styles.attendanceSummaryItem}>
              <Text style={styles.attendanceSummaryLabel}>Practical Sessions</Text>
              <Text style={styles.attendanceSummaryValue}>
                {attendanceStats.practical.presentSessions}/{attendanceStats.practical.totalSessions}
              </Text>
              <Text style={styles.attendanceSummaryRate}>
                {attendanceStats.practical.attendanceRate}% attendance
              </Text>
              {renderProgressBar(
                attendanceStats.practical.presentSessions,
                attendanceStats.practical.totalSessions,
                COLORS.blue
              )}
            </View>
          </View>
        </View>
      </ScrollView>
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

  if (user.role === 'student') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.title}>My Progress</Text>
          <View style={{ width: 24 }} />
        </View>

        {renderStudentDetails()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Progress Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Overview */}
        {stats && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              {renderStatCard(
                'Total Students',
                stats.totalStudents,
                'Active',
                COLORS.blue
              )}
              {renderStatCard(
                'Theory Pass Rate',
                `${stats.theoryPassRate}%`,
                'Success Rate',
                COLORS.brandOrange
              )}
              {renderStatCard(
                'Practical Pass Rate',
                `${stats.practicalPassRate}%`,
                'Success Rate',
                COLORS.green
              )}
              {renderStatCard(
                'Completed',
                stats.statusDistribution?.Completed || 0,
                'Finished',
                COLORS.purple
              )}
            </View>
          </View>
        )}

        {/* Status Distribution */}
        {stats?.statusDistribution && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status Distribution</Text>
            <View style={styles.statusGrid}>
              {Object.entries(stats.statusDistribution).map(([status, count]) => (
                <View key={status} style={styles.statusCard}>
                  <View style={[styles.statusIcon, { backgroundColor: getStatusColor(status) }]}>
                    <Ionicons name={getStatusIcon(status)} size={20} color={COLORS.white} />
                  </View>
                  <Text style={styles.statusCount}>{count}</Text>
                  <Text style={styles.statusName}>{status}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Students List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Progress</Text>
          {students.length > 0 ? (
            students.map(renderStudentCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No students found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalSafe}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowStudentDetails(false)}>
                <Ionicons name="arrow-back" size={24} color={COLORS.black} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Student Details</Text>
              <View style={{ width: 24 }} />
            </View>
            {renderStudentDetails()}
          </SafeAreaView>
        </View>
      )}
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
  title: { fontSize: 20, fontWeight: '600', color: COLORS.black },
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
  statValue: { fontSize: 24, fontWeight: '700', color: COLORS.black },
  statTitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  statSubtitle: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  section: { padding: 20 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statusCard: {
    width: (width - 56) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  statusCount: { fontSize: 20, fontWeight: '700', color: COLORS.black },
  statusName: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 4 },
  studentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '600', color: COLORS.black },
  studentEmail: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  studentContact: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4
  },
  statusText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  progressSection: { marginBottom: 16 },
  progressItem: { marginBottom: 12 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  progressLabel: { fontSize: 14, fontWeight: '500', color: COLORS.black },
  progressValue: { fontSize: 12, fontWeight: '600', color: COLORS.black },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.bgLight,
    borderRadius: 2,
    marginBottom: 4
  },
  progressFill: { height: '100%', borderRadius: 2 },
  progressAttempts: { fontSize: 10, color: COLORS.textMuted },
  attendanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  attendanceItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  attendanceLabel: { fontSize: 12, color: COLORS.textMuted },
  attendanceValue: { fontSize: 12, fontWeight: '600', color: COLORS.black },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 16
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    zIndex: 1000
  },
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: COLORS.black },
  detailsContainer: { flex: 1 },
  detailsCard: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  detailsTitle: { fontSize: 16, fontWeight: '600', color: COLORS.black, marginBottom: 16 },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  detailsLabel: { fontSize: 14, color: COLORS.textMuted },
  detailsValue: { fontSize: 14, color: COLORS.black, fontWeight: '500' },
  examHistorySection: { marginBottom: 20 },
  examHistoryTitle: { fontSize: 14, fontWeight: '600', color: COLORS.black, marginBottom: 12 },
  examResultItem: {
    backgroundColor: COLORS.bgLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8
  },
  examResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  examResultName: { fontSize: 14, fontWeight: '500', color: COLORS.black },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  resultBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '600' },
  examResultDate: { fontSize: 12, color: COLORS.textMuted },
  examResultAttempt: { fontSize: 10, color: COLORS.textMuted, marginTop: 4 },
  noResultsText: { fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic' },
  attendanceSummary: { gap: 20 },
  attendanceSummaryItem: { marginBottom: 16 },
  attendanceSummaryLabel: { fontSize: 14, fontWeight: '500', color: COLORS.black },
  attendanceSummaryValue: { fontSize: 16, fontWeight: '600', color: COLORS.black, marginTop: 4 },
  attendanceSummaryRate: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 }
});
