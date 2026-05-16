import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getTheme } from '../../theme';

export default function DebateArenaScreen({ navigation }) {
  const { user } = useAuth();
  const theme = getTheme(user);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>Debate Arena</Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>Voice debate coming soon</Text>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.accent }]} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>End Debate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '900', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 40 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', width: '100%' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
