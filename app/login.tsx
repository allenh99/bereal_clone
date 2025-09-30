import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/services/context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Login failed', e?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 16 }}>Login</Text>
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 }} />
      <TouchableOpacity onPress={onLogin} style={{ backgroundColor: '#111', padding: 14, borderRadius: 8 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>{loading ? 'Signing in…' : 'Sign In'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/signup')} style={{ marginTop: 12 }}>
        <Text style={{ color: '#007aff', textAlign: 'center' }}>No account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}


