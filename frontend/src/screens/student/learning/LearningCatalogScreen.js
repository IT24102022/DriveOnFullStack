import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../theme';
import { getLearningCatalog } from '../../../services/learningApi';
import { useAuth } from '../../../context/AuthContext';

export default function LearningCatalogScreen({ navigation }) {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCatalog = useCallback(async () => {
    try {
      const res = await getLearningCatalog();
      setTopics(res.data || []);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Could not load learning content');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadCatalog(); }, [loadCatalog]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.brandOrange} /></View>;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadCatalog();
            }}
          />
        }
      >
        <TouchableOpacity
          style={styles.refreshRow}
          onPress={() => { setRefreshing(true); loadCatalog(); }}
          disabled={refreshing}
        >
          <Ionicons name="refresh-outline" size={16} color={COLORS.brandOrange} />
          <Text style={styles.refreshText}>{refreshing ? 'Refreshing...' : 'All Learning Content'}</Text>
        </TouchableOpacity>

        {topics.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="school-outline" size={48} color={COLORS.brandOrange} />
            <Text style={styles.emptyText}>No learning content yet.</Text>
          </View>
        ) : (
          topics.map((t) => (
            <View key={t._id} style={styles.topicCard}>
              <Text style={styles.topicTitle}>{t.title}</Text>
              {!!t.description && <Text style={styles.topicDesc}>{t.description}</Text>}

              {(t.lessons || []).length === 0 ? (
                <Text style={styles.lessonEmpty}>No lessons in this topic.</Text>
              ) : (
                (t.lessons || []).map((l) => (
                  <TouchableOpacity
                    key={l._id}
                    style={styles.lessonCard}
                    onPress={() => navigation.navigate('Lesson', { lesson: l })}
                  >
                    <View style={styles.lessonTop}>
                      <Text style={styles.lessonTitle}>{l.title}</Text>
                      <View style={styles.badges}>
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{l.contentType}</Text>
                        </View>
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{l.estimatedDuration || 0}m</Text>
                        </View>
                      </View>
                    </View>
                    {!!l.description && <Text style={styles.lessonDesc} numberOfLines={2}>{l.description}</Text>}
                    <Text style={styles.lessonMeta}>
                      {(l.videoTutorials || []).length} videos · {(l.quizzes || []).length} quizzes
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Admin FAB */}
      {user?.role === 'admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateLearningContent')}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: COLORS.gray,
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.black },
  content: { padding: 16, paddingBottom: 40 },
  refreshRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  refreshText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
  topicCard: { backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12 },
  topicTitle: { fontSize: 16, fontWeight: '800', color: COLORS.black },
  topicDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 4, marginBottom: 8 },
  lessonEmpty: { fontSize: 12, color: COLORS.textMuted, marginTop: 8 },
  lessonCard: { backgroundColor: COLORS.bgLight, borderRadius: 14, padding: 12, marginTop: 10, borderWidth: 1, borderColor: COLORS.borderLight },
  lessonTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  lessonTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: COLORS.black },
  badges: { flexDirection: 'row', gap: 6 },
  badge: { backgroundColor: COLORS.brandYellow, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: '800', color: COLORS.black },
  lessonDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 6 },
  lessonMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 6 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.brandOrange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

