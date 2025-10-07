import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import CaptureScreen from '../../app/capture';
import { fixtures } from '../../src/test-utils/fixtures';
import { __queuePicture, __resetCameraMock } from '../../__mocks__/expo-camera';
import * as FS from '../../__mocks__/expo-file-system';

describe('Capture flow', () => {
	beforeEach(async () => {
		__resetCameraMock();
		await fixtures.populated({ users: [{ id: 'u1', email: 'a@x.com', role: 'admin' }], sessionUserId: 'u1' });
	});

	it('captures front then back and saves files', async () => {
		__queuePicture('FRONT');
		__queuePicture('BACK');
		render(<CaptureScreen />);
		fireEvent.press(screen.getByText(/Capture Front/i));
		await act(async () => {});
		fireEvent.press(screen.getByText(/Capture Back/i));
		await waitFor(() => expect(screen.getByText(/Saved!/i)).toBeTruthy());
		// Ensure something written under BeReal/users/u1/all_photos
		const info = await FS.getInfoAsync('fs://doc/BeReal/users/u1/all_photos/');
		expect(info.exists).toBe(true);
	});
});


