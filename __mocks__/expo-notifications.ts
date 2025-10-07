const scheduled: any[] = [];

module.exports = {
	AndroidImportance: { DEFAULT: 3 },
	getPermissionsAsync: async () => ({ granted: true }),
	requestPermissionsAsync: async () => ({ granted: true }),
	setNotificationHandler: () => {},
	setNotificationChannelAsync: async () => {},
	cancelAllScheduledNotificationsAsync: async () => {
		scheduled.length = 0;
	},
	scheduleNotificationAsync: async (spec: any) => {
		scheduled.push(spec);
		return 'mock-id';
	},
	__getScheduled: () => scheduled,
};


