import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { AuthProvider } from '../src/services/context/AuthContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    // Android channel for notifications
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('bereal-daily', {
        name: 'Daily BeReal',
        importance: Notifications.AndroidImportance.DEFAULT,
      }).catch(() => {});
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="index" options={{ title: 'Timeline' }} />
            <Stack.Screen name="capture" options={{ title: 'Capture' }} />
            <Stack.Screen name="login" options={{ title: 'Login' }} />
            <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
            <Stack.Screen name="profile" options={{ title: 'Profile' }} />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


