import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getStudentById, toggleReminders } from '../services/studentApi';
import { COLORS } from '../theme';

export default function StudentHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data } = await getStudentById(user._id);
        setStudent(data);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchStudent();
    else setLoading(false);
  }, []);

  const handleToggleReminders = async () => {
    try {
      await toggleReminders(user._id);
      setStudent(prev => ({ ...prev, reminderNotifications: !prev.reminderNotifications }));
    } catch {}
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.brandOrange} /></View>;

  const upcomingSessions = student?.bookedSessions?.filter(
    s => s.status === 'Scheduled' || s.status === 'Pending'
  ) || [];

  const completedSessions = student?.bookedSessions?.filter(
    s => s.status === 'Completed'
  ) || [];

  const totalPaid = student?.enrolledCourses?.reduce((sum, c) => {
    return sum + ((c.courseFee - (c.discount || 0)) - (c.remainingBalance || 0));
  }, 0) || 0;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          <Text style={{ color: COLORS.black }}>Drive</Text>
          <Text style={{ color: COLORS.brandOrange }}>O</Text>
          <Text style={{ color: COLORS.black }}>n</Text>
        </Text>
        <View style={styles.studentBadge}>
          <Ionicons name="school" size={14} color={COLORS.black} />
          <Text style={styles.studentBadgeText}>Student</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(student?.firstName || user?.name || 'S')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.flex1}>
            <Text style={styles.profileName}>
              {student?.firstName ? `${student.firstName} ${student.lastName}` : user?.name}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            {student?.NIC && <Text style={styles.profileNIC}>NIC: {student.NIC}</Text>}
          </View>
          <View style={[styles.statusBadge, {
            backgroundColor: student?.accountStatus === 'Suspended' ? COLORS.redBg : COLORS.greenBg,
          }]}>
            <Text style={[styles.statusText, {
              color: student?.accountStatus === 'Suspended' ? COLORS.red : COLORS.green,
            }]}>{student?.accountStatus || 'Active'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Sessions Done', value: completedSessions.length },
            { label: 'Upcoming',      value: upcomingSessions.length  },
            { label: 'Total Paid',    value: `LKR ${totalPaid.toLocaleString()}` },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue} numberOfLines={1}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Reminders toggle */}
        <View style={styles.reminderCard}>
          <View style={styles.flex1}>
            <Text style={styles.reminderTitle}>Session Reminders</Text>
            <Text style={styles.reminderSub}>Get notified before your sessions</Text>
          </View>
          <Switch
            value={student?.reminderNotifications || false}
            onValueChange={handleToggleReminders}
            trackColor={{ false: COLORS.borderLight, true: COLORS.brandOrange }}
            thumbColor={COLORS.white}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'school-outline',   label: 'Take Quiz',   screen: 'Learning'   },
            { icon: 'card-outline',     label: 'Payments',    screen: 'Payments'   },
            { icon: 'person-outline',   label: 'My Profile',  screen: 'Account'    },
            { icon: 'document-text-outline', label: 'Progress', screen: 'Learning' },
            { icon: 'calendar-outline', label: 'Book Session', screen: 'AvailableSessions' },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionCard}
              onPress={() => navigation.navigate(a.screen)}
            >
              <Ionicons name={a.icon} size={24} color={COLORS.brandOrange} />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Enrolled Courses */}
        {student?.enrolledCourses?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>My Courses</Text>
            {student.enrolledCourses.map((course) => (
              <View key={course._id} style={styles.courseCard}>
                <Text style={styles.courseCategory}>
                  {course.licenseCategory?.licenseCategoryName || 'Course'}
                </Text>
                <View style={styles.courseRow}>
                  <Text style={styles.courseFee}>LKR {course.courseFee?.toLocaleString()}</Text>
                  <View style={[styles.balanceBadge, {
                    backgroundColor: course.remainingBalance > 0 ? COLORS.redBg : COLORS.greenBg,
                  }]}>
                    <Text style={[styles.balanceText, {
                      color: course.remainingBalance > 0 ? COLORS.red : COLORS.green,
                    }]}>
                      {course.remainingBalance > 0
                        ? `LKR ${course.remainingBalance?.toLocaleString()} due`
                        : 'Fully Paid ✓'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.white },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: COLORS.gray, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  logo:          { fontSize: 28, fontWeight: '800' },
  studentBadge:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.brandYellow, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  studentBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.black },
  content:       { padding: 20, paddingBottom: 40 },
  profileCard:   { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.brandYellow, borderRadius: 20, padding: 16, marginBottom: 16 },
  avatar:        { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  avatarText:    { fontSize: 22, fontWeight: '800', color: COLORS.black },
  flex1:         { flex: 1 },
  profileName:   { fontSize: 16, fontWeight: '700', color: COLORS.black },
  profileEmail:  { fontSize: 12, color: COLORS.textMuted },
  profileNIC:    { fontSize: 11, color: COLORS.textMuted },
  statusBadge:   { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusText:    { fontSize: 11, fontWeight: '700' },
  statsRow:      { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard:      { flex: 1, backgroundColor: COLORS.bgLight, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight },
  statValue:     { fontSize: 16, fontWeight: '800', color: COLORS.black },
  statLabel:     { fontSize: 9, color: COLORS.textMuted, textAlign: 'center', marginTop: 2 },
  reminderCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 16, marginBottom: 20 },
  reminderTitle: { fontSize: 14, fontWeight: '600', color: COLORS.black },
  reminderSub:   { fontSize: 12, color: COLORS.textMuted },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: COLORS.black, marginBottom: 12 },
  actionsGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  actionCard:    { width: '47%', backgroundColor: COLORS.bgLight, borderRadius: 14, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.borderLight },
  actionLabel:   { fontSize: 12, fontWeight: '600', color: COLORS.black },
  courseCard:    { backgroundColor: COLORS.bgLight, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.borderLight },
  courseCategory:{ fontSize: 13, fontWeight: '700', color: COLORS.black, marginBottom: 8 },
  courseRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  courseFee:     { fontSize: 15, fontWeight: '700', color: COLORS.black },
  balanceBadge:  { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  balanceText:   { fontSize: 12, fontWeight: '600' },
  logoutBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.red, borderRadius: 14, paddingVertical: 14, marginTop: 8 },
  logoutText:    { fontSize: 15, fontWeight: '700', color: COLORS.red },
});
