import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getTheme, isJuniorUser } from '../../theme';
import HUDCard from '../../components/HUDCard';
import ModeCard from '../../components/ModeCard';
import { api } from '../../api';

export default function DashboardScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const theme = getTheme(user);
  const isJunior = isJuniorUser(user);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const activeId = user?.studentId || user?.username;
      const data = await api.getAnalytics(activeId);
      setStats(data);
      // Sync token/streak back to context
      if (data) {
        updateUser({
          gforceTokens: Math.round(data.gforce_tokens || 0),
          streak: data.current_streak || 0,
          rank: data.tier?.name || null
        });
      }
    } catch (err) {
      console.log('Stats error', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const gforce = Math.round(stats?.gforce_tokens || user?.gforceTokens || 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
      >
        <View style={styles.header}>
          <Text style={[styles.welcome, { color: theme.textMuted }]}>Welcome back,</Text>
          <Text style={[styles.name, { color: theme.text }]}>{user?.name}</Text>
          <View style={styles.pillRow}>
            <View style={[styles.pill, { backgroundColor: theme.accentLight, borderColor: theme.accentBorder }]}>
              <Text style={[styles.pillText, { color: theme.accent }]}>🔥 {user?.streak || 0} Day Streak</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <Text style={[styles.pillText, { color: theme.text }]}>🏆 {user?.rank || 'Unranked'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.hudGrid}>
          <HUDCard icon="award" label="Total Debates" value={stats?.total_debates || 0} color={isJunior ? theme.accent : "#FF6B00"} />
          <HUDCard icon="star" label="Avg Score" value={stats?.avg_score ? stats.avg_score.toFixed(1) : '—'} color="#00d4ff" />
          <HUDCard icon="zap" label="GForce Tokens" value={gforce.toLocaleString()} color={theme.purple} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose Your Mode</Text>
        
        <ModeCard
          title="Debate Arena"
          desc="1-on-1 ranked debate with AI."
          tag="RANKED"
          icon="zap"
          color="#FF6B00"
          gradient={['#1c0a00', '#3d1200']}
          onPress={() => navigation.navigate('DebateArena')}
        />

        <ModeCard
          title="Super Tutor"
          desc="Ask questions, drill concepts."
          tag="COACHING"
          icon="message-circle"
          color="#10b981"
          gradient={['#001a11', '#002a1a']}
          onPress={() => alert('Super Tutor coming soon')}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 24 },
  welcome: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  name: { fontSize: 32, fontWeight: '900', marginBottom: 12 },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  pillText: { fontSize: 12, fontWeight: 'bold' },
  hudGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 16 },
});
