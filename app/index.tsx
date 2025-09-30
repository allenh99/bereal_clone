import React, { useEffect } from 'react';
import { View, FlatList, Image, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TimelineService } from '../src/services/TimelineService';
import { NotificationService } from '../src/services/NotificationService';

export default function TimelineScreen() {
  const router = useRouter();
  const [posts, setPosts] = React.useState([] as ReturnType<typeof TimelineService.groupedPosts>);

  useEffect(() => {
    NotificationService.ensurePermissionAndSchedule();
    TimelineService.loadNextPage().then(() => {
      setPosts(TimelineService.groupedPosts());
    });
  }, []);

  const loadMore = () => {
    TimelineService.loadNextPage().then(() => setPosts(TimelineService.groupedPosts()));
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <TouchableOpacity onPress={() => router.push('/capture')} style={{ marginBottom: 12, backgroundColor: '#111', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Capture BeReal</Text>
      </TouchableOpacity>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.key}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ marginBottom: 6, fontWeight: '600' }}>{item.displayDate}</Text>
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


