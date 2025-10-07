export async function getPermissionsAsync() { return { granted: true }; }
export async function requestPermissionsAsync() { return { granted: true }; }
export async function cancelAllScheduledNotificationsAsync() { /* no-op */ }
export async function scheduleNotificationAsync(_opts: any) { return 'mock-notification-id'; }
export const AndroidImportance = { DEFAULT: 3 };
export function setNotificationHandler() { /* no-op */ }
export async function setNotificationChannelAsync() { /* no-op */ }

module.exports = {
  getPermissionsAsync,
  requestPermissionsAsync,
  cancelAllScheduledNotificationsAsync,
  scheduleNotificationAsync,
  AndroidImportance,
  setNotificationHandler,
  setNotificationChannelAsync,
};


