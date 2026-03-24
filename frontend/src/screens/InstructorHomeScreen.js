import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getInstructorById, getNotifications, markAllRead } from '../services/instructorVehicleApi';
import { COLORS } from '../theme';

export default function InstructorHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [instructor, setInstructor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ins, notifs] = await Promise.all([
          getInstructorById(user._id),
          getNotifications(user._id),
        ]);
        setInstructor(ins.data);
        setNotifications(notifs.data);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchData();
    else setLoading(false);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead(user._id);
      setNotifications(prev => prev.map(n => ({ ...n, status: 'Read' })));
    } catch {}
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.brandOrange} /></View>;

  const unreadCount  = notifications.filter(n => n.status === 'Unread').length;
  const upcomingSessions = instructor?.sessions?.filter(
    s => s.status === 'Scheduled' || s.status === 'Pending'
  ) || [];
  const completedSessions = instructor?.sessions?.filter(
    s => s.status === 'Completed'
  ) || [];

  const notifTypeColors = {
    SessionAssigned: { bg: COLORS.greenBg, text: COLORS.green,       icon: 'calendar-outline'   },
    SessionCancelled:{ bg: COLORS.redBg,   text: COLORS.red,         icon: 'close-circle-outline'},
    InsuranceExpiry: { bg: '#FFF3CD',      text: '#856404',           icon: 'warning-outline'    },
    General:         { bg: COLORS.blueBg,  text: COLORS.blue,        icon: 'information-circle-outline' },
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          <Text style={{ color: COLORS.black }}>Drive</Text>
          <Text style={{ color: COLORS.brandOrange }}>O</Text>
          <Text style={{ color: COLORS.black }}>n</Text>
        </Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadCount}</Text>
            </View>
          )}
          <View style={styles.instructorBadge}>
            <Ionicons name="car" size={14} color={COLORS.black} />
            <Text style={styles.instructorBadgeText}>Instructor</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(instructor?.fullName || user?.fullName || 'I')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.flex1}>
            <Text style={styles.name}>{instructor?.fullName || user?.fullName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.spec}>{instructor?.specialization || 'Both'} · {instructor?.experience || 0} yrs exp</Text>
          </View>
          <View style={[styles.availBadge, {
            backgroundColor: instructor?.available ? COLORS.greenBg : COLORS.redBg,
          }]}>
            <Text style={[styles.availText, {
              color: instructor?.available ? COLORS.green : COLORS.red,
            }]}>{instructor?.available ? 'Available' : 'Busy'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Upcoming',   value: upcomingSessions.length    },
            { label: 'Completed',  value: completedSessions.length   },
            { label: 'Vehicles',   value: instructor?.assignedVehicles?.length || 0 },
            { label: 'Unread',     value: unreadCount                },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Assigned Vehicles */}
        {instructor?.assignedVehicles?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>My Vehicles</Text>
            {instructor.assignedVehicles.map((v) => (
              <View key={v._id} style={styles.vehicleCard}>
                <View style={styles.vehicleIcon}>
                  <Ionicons name="car-outline" size={22} color={COLORS.black} />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.vehicleName}>{v.brand} {v.model}</Text>
                  <Text style={styles.vehicleMeta}>{v.licensePlate} · {v.vehicleType}</Text>
                </View>
                <View style={[styles.availBadge, {
                  backgroundColor: v.available ? COLORS.greenBg : COLORS.redBg,
                }]}>
                  <Text style={[styles.availText, { color: v.available ? COLORS.green : COLORS.red }]}>
                    {v.available ? 'Available' : 'In Use'}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Notifications */}
        <View style={styles.notifHeader}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyNotif}>
            <Ionicons name="notifications-off-outline" size={36} color={COLORS.textMuted} />
            <Text style={styles.emptyNotifText}>No notifications yet</Text>
          </View>
        ) : (
          notifications.slice(0, 5).map((n) => {
            const colors = notifTypeColors[n.type] || notifTypeColors.General;
            return (
              <View key={n._id} style={[styles.notifCard, n.status === 'Unread' && styles.notifCardUnread]}>
                <View style={[styles.notifIcon, { backgroundColor: colors.bg }]}>
                  <Ionicons name={colors.icon} size={18} color={colors.text} />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.notifMessage}>{n.message}</Text>
                  <Text style={styles.notifDate}>{new Date(n.date).toLocaleDateString()}</Text>
                </View>
                {n.status === 'Unread' && <View style={styles.unreadDot} />}
              </View>
            );
          })
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
  logo:         { fontSize: 28, fontWeight: '800' },
  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifBadge:   { backgroundColor: COLORS.red, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  notifBadgeText:{ fontSize: 11, fontWeight: '800', color: COLORS.white },
  instructorBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.brandYellow, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  instructorBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.black },
  content:      { padding: 20, paddingBottom: 40 },
  profileCard:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.brandYellow, borderRadius: 20, padding: 16, marginBottom: 16 },
  avatar:       { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 22, fontWeight: '800', color: COLORS.black },
  flex1:        { flex: 1 },
  name:         { fontSize: 16, fontWeight: '700', color: COLORS.black },
  email:        { fontSize: 12, color: COLORS.textMuted },
  spec:         { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  availBadge:   { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  availText:    { fontSize: 11, fontWeight: '700' },
  statsRow:     { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard:     { flex: 1, backgroundColor: COLORS.bgLight, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight },
  statValue:    { fontSize: 20, fontWeight: '800', color: COLORS.black },
  statLabel:    { fontSize: 9, color: COLORS.textMuted, textAlign: 'center', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.black, marginBottom: 12 },
  vehicleCard:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 10 },
  vehicleIcon:  { backgroundColor: COLORS.brandYellow, borderRadius: 10, padding: 10 },
  vehicleName:  { fontSize: 14, fontWeight: '600', color: COLORS.black },
  vehicleMeta:  { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  notifHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  markAllText:  { fontSize: 13, fontWeight: '600', color: COLORS.brandOrange },
  emptyNotif:   { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyNotifText: { fontSize: 13, color: COLORS.textMuted },
  notifCard:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 8 },
  notifCardUnread: { borderColor: COLORS.brandOrange, backgroundColor: '#FFF8ED' },
  notifIcon:    { borderRadius: 10, padding: 8 },
  notifMessage: { fontSize: 13, color: COLORS.black, lineHeight: 18 },
  notifDate:    { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  unreadDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.brandOrange, marginTop: 4 },
  logoutBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.red, borderRadius: 14, paddingVertical: 14, marginTop: 16 },
  logoutText:   { fontSize: 15, fontWeight: '700', color: COLORS.red },
});
