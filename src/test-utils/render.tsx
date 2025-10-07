import React from 'react';
import { render as rtlRender } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../services/context/AuthContext';

export function render(ui: React.ReactElement, options?: Parameters<typeof rtlRender>[1]) {
	return rtlRender(
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<AuthProvider>{ui}</AuthProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>,
		options
	);
}


