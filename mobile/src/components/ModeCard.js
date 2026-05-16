import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ModeCard({ title, desc, tag, icon, color, gradient, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      <LinearGradient colors={gradient} style={styles.gradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: `${color}25`, borderColor: `${color}40` }]}>
            <Feather name={icon} size={22} color={color} />
          </View>
          {tag && (
            <View style={[styles.tag, { backgroundColor: `${color}18`, borderColor: `${color}30` }]}>
              <Text style={[styles.tagText, { color }]}>{tag}</Text>
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{desc}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={[styles.startText, { color }]}>Start Now</Text>
          <Feather name="chevron-right" size={16} color={color} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  content: {
    marginTop: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  desc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 4,
  },
  startText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
