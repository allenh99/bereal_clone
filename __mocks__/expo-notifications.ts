const scheduled: any[] = [];

const mock = {
	AndroidImportance: { DEFAULT: 3 },
	getPermissionsAsync: jest.fn(async () => ({ granted: true })),
	requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
	setNotificationHandler: jest.fn(() => {}),
	setNotificationChannelAsync: jest.fn(async () => {}),
	cancelAllScheduledNotificationsAsync: jest.fn(async () => {
		scheduled.length = 0;
	}),
	scheduleNotificationAsync: jest.fn(async (spec: any) => {
		scheduled.push(spec);
		return 'mock-id';
	}),
	__getScheduled: () => scheduled,
};

module.exports = mock;


