import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/services/context/AuthContext';

export default function SignupScreen() {
  const { signup } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signup(email.trim(), password);
      router.replace('/profile');
    } catch (e: any) {
      Alert.alert('Sign up failed', e?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 16 }}>Create account</Text>
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 }} />
      <TouchableOpacity onPress={onSignup} style={{ backgroundColor: '#111', padding: 14, borderRadius: 8 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>{loading ? 'Creating…' : 'Create account'}</Text>
      </TouchableOpacity>
    </View>
  );
}


