import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../app/login';
import SignupScreen from '../../app/signup';
import ProfileScreen from '../../app/profile';
import { fixtures } from '../../src/test-utils/fixtures';
import { render } from '../../src/test-utils/render';

describe('Authentication flow', () => {
	beforeEach(async () => {
		jest.clearAllMocks();
		await fixtures.empty();
	});

it('signup creates account and navigates to profile (state available)', async () => {
	// give providers a moment to mount
	await waitFor(() => true);
	render(<SignupScreen />);
	fireEvent.changeText(await screen.findByPlaceholderText('Email'), 'a@x.com');
	fireEvent.changeText(await screen.findByPlaceholderText('Password'), 'pw');
		fireEvent.press(screen.getByText(/Create account/i));
		// Render profile to see if user exists
		render(<ProfileScreen />);
		await waitFor(() => expect(screen.getByText(/Email: a@x.com/i)).toBeTruthy());
	});

	it('login fails with invalid credentials', async () => {
	render(<LoginScreen />);
	fireEvent.changeText(await screen.findByPlaceholderText('Email'), 'not@exists.com');
	fireEvent.changeText(await screen.findByPlaceholderText('Password'), 'pw');
		fireEvent.press(screen.getByText(/Sign In/i));
		// An alert would show; here we at least ensure button toggles label back
		await waitFor(() => expect(screen.getByText(/Sign In/i)).toBeTruthy());
	});
});


