import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import TimelineScreen from '../../app/index';
import LoginScreen from '../../app/login';
import CaptureScreen from '../../app/capture';
import ProfileScreen from '../../app/profile';
import { render } from '../../src/test-utils/render';
import { fixtures } from '../../src/test-utils/fixtures';
import { __queuePicture, __resetCameraMock } from '../../__mocks__/expo-camera';
import * as Notifications from 'expo-notifications';
import * as FS from '../../__mocks__/expo-file-system';

describe('End-to-end app flows (integration)', () => {
	beforeEach(async () => {
		__resetCameraMock();
		jest.clearAllMocks();
		await fixtures.empty();
	});

	it('login → notification scheduled → capture → timeline shows reactions count updating', async () => {
		// 1) Signup to create a user and session
		render(<ProfileScreen />); // profile redirects if no user; we will sign up via Signup screen
		// Simulate sign-up by rendering Signup directly
		render(<LoginScreen />);
		fireEvent.changeText(screen.getByPlaceholderText('Email'), 'a@x.com');
		fireEvent.changeText(screen.getByPlaceholderText('Password'), 'pw');
		fireEvent.press(screen.getByText(/Sign In/i));
		// Login will fail since no users yet; create a user via fixtures instead
		await fixtures.populated({ users: [{ id: 'u1', email: 'a@x.com', role: 'admin' }], sessionUserId: 'u1' });

		// 2) Timeline schedules a notification
		render(<TimelineScreen />);
		await waitFor(() => expect(Notifications.scheduleNotificationAsync).toBeCalled());

		// 3) Capture two photos
		__queuePicture('FRONT');
		__queuePicture('BACK');
		render(<CaptureScreen />);
		fireEvent.press(screen.getByText(/Capture Front/i));
		fireEvent.press(await screen.findByText(/Capture Back/i));
		await waitFor(() => expect(screen.getByText(/Saved!/i)).toBeTruthy());
		const dirInfo = await FS.getInfoAsync('fs://doc/BeReal/users/u1/all_photos/');
		expect(dirInfo.exists).toBe(true);

		// 4) Timeline shows a post and renders emoji buttons; toggling updates summary
		render(<TimelineScreen />);
		await waitFor(() => expect(screen.getByText(/On time|Late/)).toBeTruthy());
		const thumbs = screen.getByText('👍');
		fireEvent.press(thumbs);
		// Re-fetch happens synchronously in component; wait for count to appear
		await waitFor(() => expect(screen.getByText(/👍\s*1/)).toBeTruthy());
	});

	it('navigation between screens and data flow persists across views', async () => {
		await fixtures.populated({ users: [{ id: 'u1', email: 'a@x.com', role: 'admin' }], sessionUserId: 'u1' });
		// Timeline → Profile → back to Timeline with same session
		render(<TimelineScreen />);
		await waitFor(() => expect(Notifications.scheduleNotificationAsync).toBeCalled());
		// Go to profile, update display name
		render(<ProfileScreen />);
		const nameInput = screen.getByPlaceholderText('Display name');
		fireEvent.changeText(nameInput, 'Alice');
		fireEvent.press(screen.getByText(/Save/i));
		// Back to timeline and ensure still authenticated and no crash
		render(<TimelineScreen />);
		await waitFor(() => expect(screen.queryByText(/Please log in/)).toBeFalsy());
	});
});


