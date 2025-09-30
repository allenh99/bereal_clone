import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export class NotificationService {
  static async ensurePermissionAndSchedule(): Promise<void> {
    const settings = await Notifications.getPermissionsAsync();
    if (!settings.granted) {
      await Notifications.requestPermissionsAsync();
    }
    await this.scheduleRandomDaily();
  }

  static async scheduleRandomDaily(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const now = new Date();
    const hour = Math.floor(Math.random() * 12) + 8; // between 8am-8pm
    const minute = Math.floor(Math.random() * 60);
    const trigger = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
    if (trigger.getTime() <= now.getTime()) {
      trigger.setDate(trigger.getDate() + 1);
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to BeReal',
        body: 'Capture your moment with front and back cameras.',
      },
      trigger: Platform.select({
        ios: { date: trigger },
        android: { channelId: 'bereal-daily', date: trigger } as any,
        default: { date: trigger } as any,
      }) as any,
    });
  }
}


