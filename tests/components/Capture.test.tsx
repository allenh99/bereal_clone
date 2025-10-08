import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import CaptureScreen from '../../app/capture';
import { fixtures } from '../../src/test-utils/fixtures';
import { __queuePicture, __queuePictureError, __resetCameraMock, __requestPermissionMock } from 'expo-camera';
import * as FS from 'expo-file-system/legacy';
import { render } from '../../src/test-utils/render';

describe('Capture flow', () => {
	beforeEach(async () => {
		__resetCameraMock();
		await fixtures.populated({ users: [{ id: 'u1', email: 'a@x.com', role: 'admin' }], sessionUserId: 'u1' });
	});

it('captures front then back and saves files', async () => {
	await waitFor(() => true);
		__queuePicture('FRONT');
		__queuePicture('BACK');
	render(<CaptureScreen />);
	fireEvent.press(await screen.findByText(/Capture Front/i));
		await act(async () => {});
		fireEvent.press(screen.getByText(/Capture Back/i));
		await waitFor(() => expect(screen.getByText(/Saved!/i)).toBeTruthy());
		// Ensure something written under BeReal/users/u1/all_photos
		const info = await FS.getInfoAsync('fs://doc/BeReal/users/u1/all_photos/');
		expect(info.exists).toBe(true);
	});

it('initial render requests permission if not granted', async () => {
	await waitFor(() => true);
	jest.spyOn(require('expo-camera'), 'useCameraPermissions').mockReturnValue([{ granted: false }, __requestPermissionMock] as any);
		render(<CaptureScreen />);
		await waitFor(() => expect(__requestPermissionMock).toHaveBeenCalled());
	});

it('handles photo capture failure gracefully', async () => {
	await waitFor(() => true);
		__queuePicture('FRONT');
		__queuePictureError('camera error on back');
		render(<CaptureScreen />);
	fireEvent.press(await screen.findByText(/Capture Front/i));
		await act(async () => {});
		fireEvent.press(screen.getByText(/Capture Back/i));
		// No crash, no Saved! text
		await act(async () => {});
		expect(screen.queryByText(/Saved!/i)).toBeNull();
	});

it('retake functionality: after first front capture you can capture back; if back fails you can press again', async () => {
	await waitFor(() => true);
		__queuePicture('FRONT');
		__queuePictureError('back failed');
		__queuePicture('BACK-RETRY');
		render(<CaptureScreen />);
		fireEvent.press(screen.getByText(/Capture Front/i));
		await act(async () => {});
		fireEvent.press(screen.getByText(/Capture Back/i));
		await act(async () => {});
		// retry back
		fireEvent.press(screen.getByText(/Capture Back/i));
		await waitFor(() => expect(screen.getByText(/Saved!/i)).toBeTruthy());
	});

it('submit/cancel actions: navigate back after success', async () => {
	await waitFor(() => true);
		__queuePicture('FRONT');
		__queuePicture('BACK');
		// spy on router.replace
		const mockRouter = { replace: jest.fn(), push: jest.fn(), back: jest.fn() };
	jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue(mockRouter as any);
	render(<CaptureScreen />);
	fireEvent.press(await screen.findByText(/Capture Front/i));
		fireEvent.press(await screen.findByText(/Capture Back/i));
		await waitFor(() => expect(screen.getByText(/Saved!/i)).toBeTruthy());
		await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/'));
	});
});


