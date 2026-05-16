import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', username: '', password: '', grade: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleRegister = async () => {
    if (!form.name || !form.username || !form.password || !form.grade) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await api.register(form);
      await login(data.user, data.token);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Join G FORCE</Text>
      <Text style={styles.subtitle}>Create your account</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#64748B" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
      <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#64748B" autoCapitalize="none" value={form.username} onChangeText={(t) => setForm({ ...form, username: t })} />
      <TextInput style={styles.input} placeholder="Class/Grade (e.g. Class 5, Level 5)" placeholderTextColor="#64748B" value={form.grade} onChangeText={(t) => setForm({ ...form, grade: t })} />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#64748B" secureTextEntry value={form.password} onChangeText={(t) => setForm({ ...form, password: t })} />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#000', justifyContent: 'center', padding: 24 },
  title: { color: '#FF6B00', fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#64748B', fontSize: 16, textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#111', color: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#FF6B00', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  error: { color: '#ef4444', textAlign: 'center', marginBottom: 16 },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#FF6B00' },
});
