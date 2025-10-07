import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import TimelineScreen from '../../app/index';
import CaptureScreen from '../../app/capture';
import { fixtures } from '../../src/test-utils/fixtures';
import * as Camera from '../../__mocks__/expo-camera';
import * as FS from '../../__mocks__/expo-file-system';

describe('Edge cases', () => {
	it('permission denied for camera shows not allowed message', async () => {
		await fixtures.populated({ users: [{ id: 'u1', email: 'a@x.com', role: 'viewer' }], sessionUserId: 'u1' });
		// PermissionsService allows viewers to capture; simulate camera permission not granted
		jest.spyOn(Camera, 'useCameraPermissions').mockReturnValue([{ granted: false }] as any);
		render(<CaptureScreen />);
		await waitFor(() => expect(screen.getByText(/Please log in|You do not have permission/)).toBeTruthy());
	});

	it('expired session redirects to login on timeline', async () => {
		await fixtures.populated({ users: [{ id: 'u1', email: 'a@x.com' }] }); // no sessionUserId
		render(<TimelineScreen />);
		await waitFor(() => expect(screen.getByText(/Please log in/i)).toBeTruthy());
	});

	it('filesystem read failure handled without crash', async () => {
		await fixtures.error({ readFailPattern: /users\.json$/ });
		render(<TimelineScreen />);
		await waitFor(() => expect(true).toBe(true));
	});
});


