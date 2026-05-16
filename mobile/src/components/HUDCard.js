import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getTheme } from '../../theme';

export default function HUDCard({ icon, label, value, color }) {
  const { user } = useAuth();
  const theme = getTheme(user);

  return (
    <View style={[styles.card, { backgroundColor: theme.bgCardAlt, borderColor: theme.surfaceBorder }]}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
        <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
  },
});
