import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getSessions, deleteSession } from '../../services/api';
import { COLORS } from '../../theme';

const TABS = ['Upcoming', 'Past', 'All'];

const statusColor = {
  Pending:   { bg: COLORS.blueBg,  text: COLORS.blue  },
  Confirmed: { bg: COLORS.greenBg, text: COLORS.green  },
  Completed: { bg: COLORS.greenBg, text: COLORS.green  },
  Cancelled: { bg: COLORS.redBg,   text: COLORS.red    },
};

export default function SessionsScreen({ navigation }) {
  const [sessions,  setSessions]  = useState([]);
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const { data } = await getSessions();
      setSessions(data);
    } catch (err) {
      Alert.alert('Error', 'Could not load sessions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const filtered = sessions.filter((s) => {
    if (activeTab === 'Upcoming') return s.status === 'Pending' || s.status === 'Confirmed';
    if (activeTab === 'Past')     return s.status === 'Completed' || s.status === 'Cancelled';
    return true;
  });

  const handleCancel = (id) => {
    Alert.alert('Cancel Session', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSession(id);
            fetchSessions();
          } catch {
            Alert.alert('Error', 'Could not cancel session');
          }
        },
      },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.brandOrange} /></View>;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Sessions</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('BookSession', { onBack: fetchSessions })}
        >
          <Ionicons name="add" size={22} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSessions(); }} />}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.brandOrange} />
            <Text style={styles.emptyTitle}>No sessions found</Text>
            <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('BookSession')}>
              <Text style={styles.bookBtnText}>Book a Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((s) => {
            const colors = statusColor[s.status] || { bg: COLORS.gray, text: COLORS.textMuted };
            return (
              <View key={s._id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.sessionType}>{s.type} Session</Text>
                    <Text style={styles.sessionDate}>
                      {new Date(s.date).toDateString()} · {s.startTime} – {s.endTime}
                    </Text>
                    <Text style={styles.sessionMeta}>Instructor: {s.instructor?.name || 'TBA'}</Text>
                    {s.vehicle && (
                      <Text style={styles.sessionMeta}>
                        Vehicle: {s.vehicle.make} {s.vehicle.model}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.badgeText, { color: colors.text }]}>{s.status}</Text>
                  </View>
                </View>
                {(s.status === 'Pending' || s.status === 'Confirmed') && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(s._id)}>
                    <Text style={styles.cancelText}>Cancel Session</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.white },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: COLORS.gray,
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title:         { fontSize: 24, fontWeight: '600', color: COLORS.black },
  addBtn: {
    backgroundColor: COLORS.brandYellow,
    borderRadius: 12,
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgLight,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab:           { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive:     { backgroundColor: COLORS.brandYellow },
  tabText:       { fontSize: 13, fontWeight: '500', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.black, fontWeight: '700' },
  content:       { padding: 20, paddingBottom: 40 },
  empty:         { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle:    { fontSize: 16, fontWeight: '500', color: COLORS.textMuted },
  bookBtn: {
    backgroundColor: COLORS.brandOrange,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  bookBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  cardTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sessionType: { fontSize: 16, fontWeight: '600', color: COLORS.black, marginBottom: 4 },
  sessionDate: { fontSize: 13, fontWeight: '500', color: COLORS.textDark },
  sessionMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText:  { fontSize: 11, fontWeight: '700' },
  cancelBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.red,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelText: { color: COLORS.red, fontWeight: '600', fontSize: 13 },
});
