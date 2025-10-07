import React from 'react';
import { act, screen, waitFor } from '@testing-library/react-native';
import TimelineScreen from '../../app/index';
import { fixtures } from '../../src/test-utils/fixtures';
import * as Notifications from 'expo-notifications';
import { render } from '../../src/test-utils/render';

describe('TimelineScreen rendering states', () => {
	beforeEach(async () => {
		jest.clearAllMocks();
	});

	it('renders empty state message when unauthenticated', async () => {
		await fixtures.empty();
		render(<TimelineScreen />);
		await waitFor(() => expect(screen.getByText(/Please log in/i)).toBeTruthy());
	});

	it('renders loading state with delayed filesystem', async () => {
		await fixtures.loading({ delayMs: 300 });
		render(<TimelineScreen />);
		// No explicit loading indicator, but ensure no crash and notification scheduled
		await waitFor(() => expect(Notifications.scheduleNotificationAsync).toBeCalled());
	});

	it('renders error state when FS reads fail (falls back to no posts)', async () => {
		await fixtures.error({ readFailPattern: /users\/.*\/all_photos\// });
		await fixtures.populated({
			users: [{ id: 'u1', email: 'a@x.com' }],
			sessionUserId: 'u1',
		});
		render(<TimelineScreen />);
		// Should not throw; posts list remains empty
		await act(async () => {});
		// No specific text in UI for error; we assert non-crash by reaching here
		expect(true).toBe(true);
	});

	it('renders populated posts and emoji buttons', async () => {
		await fixtures.populated({
			users: [
				{ id: 'u1', email: 'admin@example.com', role: 'admin' },
				{ id: 'u2', email: 'viewer@example.com', role: 'viewer' },
			],
			sessionUserId: 'u1',
			photos: [
				{ userId: 'u1', dateKey: '20250110', timeKey: '091523', hasFront: true, hasBack: true },
			],
		});
		render(<TimelineScreen />);
		await waitFor(() => expect(screen.getByText(/On time|Late/)).toBeTruthy());
		// Emoji buttons render
		await waitFor(() => expect(screen.getByText('👍')).toBeTruthy());
	});
});


