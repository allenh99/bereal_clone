import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/services/context/AuthContext';
import { ProfileService, ProfileRecord } from '../src/services/ProfileService';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) return;
      const p = await ProfileService.getProfile(user.id);
      if (!mounted) return;
      setDisplayName(p?.displayName || '');
      setBio(p?.bio || '');
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  const onSave = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      await ProfileService.upsertProfile(user.id, { displayName, bio });
      Alert.alert('Saved', 'Profile updated');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Please log in</Text>
        <TouchableOpacity onPress={() => router.replace('/login')} style={{ marginTop: 12 }}><Text style={{ color: '#007aff' }}>Go to Login</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 16 }}>Profile</Text>
      <Text style={{ marginBottom: 8 }}>Email: {user.email} ({user.role})</Text>
      <TextInput placeholder="Display name" value={displayName} onChangeText={setDisplayName} style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 }} />
      <TextInput placeholder="Bio" value={bio} onChangeText={setBio} multiline numberOfLines={3} style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 }} />
      <TouchableOpacity onPress={onSave} style={{ backgroundColor: '#111', padding: 14, borderRadius: 8 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>{loading ? 'Saving…' : 'Save'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => logout().then(() => router.replace('/login'))} style={{ marginTop: 16 }}>
        <Text style={{ color: '#d00', textAlign: 'center' }}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}


