import React, { useEffect } from 'react';
import { View, FlatList, Image, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TimelineService } from '../src/services/TimelineService';
import { NotificationService } from '../src/services/NotificationService';
import { useAuth } from '../src/services/context/AuthContext';
import { PermissionsService } from '../src/services/PermissionsService';
import { useFocusEffect } from '@react-navigation/native';
import { RefreshControl } from 'react-native';

export default function TimelineScreen() {
  const router = useRouter();
  const [posts, setPosts] = React.useState([] as ReturnType<typeof TimelineService.groupedPosts>);
  const { user, loading } = useAuth();
  const [canCapture, setCanCapture] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [scope, setScope] = React.useState<'mine' | 'all'>('all');

  useEffect(() => {
    NotificationService.ensurePermissionAndSchedule();
  }, []);

  useEffect(() => {
    TimelineService.setScope(scope);
    TimelineService.reset();
    TimelineService.loadNextPage().then(() => setPosts(TimelineService.groupedPosts()));
  }, [user, scope]);

  useEffect(() => {
    PermissionsService.can('capture', user).then(setCanCapture);
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      // Reload when returning to timeline (e.g., after capture)
      TimelineService.reset();
      TimelineService.loadNextPage().then(() => setPosts(TimelineService.groupedPosts()));
      return () => {};
    }, [user])
  );

  const loadMore = () => {
    TimelineService.loadNextPage().then(() => setPosts(TimelineService.groupedPosts()));
  };

  if (!loading && !user) {
    return (
      <View style={{ flex: 1, padding: 12, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ marginBottom: 12 }}>Please log in to view your timeline.</Text>
        <TouchableOpacity onPress={() => router.replace('/login')} style={{ backgroundColor: '#111', padding: 12, borderRadius: 8 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        {canCapture && (
          <TouchableOpacity onPress={() => router.push('/capture')} style={{ backgroundColor: '#111', padding: 12, borderRadius: 8, flex: 1 }}>
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Capture</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => router.push('/profile')} style={{ backgroundColor: '#444', padding: 12, borderRadius: 8, flex: 1 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const next = scope === 'mine' ? 'all' : 'mine';
            setScope(next);
          }}
          style={{ backgroundColor: '#007aff', padding: 12, borderRadius: 8, flex: 1 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>{scope === 'mine' ? 'Show All' : 'Show Mine'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.key}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          TimelineService.reset();
          TimelineService.loadNextPage().then(() => setPosts(TimelineService.groupedPosts())).finally(() => setRefreshing(false));
        }} />}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ marginBottom: 6, fontWeight: '600' }}>{item.displayDate}{item.userLabel ? ` · ${item.userLabel}` : ''}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {item.front && (
                <Image source={{ uri: item.front.uri }} style={{ width: 160, height: 160, borderRadius: 8, backgroundColor: '#eee' }} />
              )}
              {item.back && (
                <Image source={{ uri: item.back.uri }} style={{ width: 160, height: 160, borderRadius: 8, backgroundColor: '#eee' }} />
              )}
            </View>
            <Text style={{ marginTop: 6, color: '#666' }}>{item.statusLabel}</Text>
          </View>
        )}
      />
    </View>
  );
}


