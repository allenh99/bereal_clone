import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

jest.mock('expo-file-system/legacy', () => require('./__mocks__/expo-file-system'));
jest.mock('expo-crypto', () => require('./__mocks__/expo-crypto'));
jest.mock('expo-notifications', () => require('./__mocks__/expo-notifications'));

// Router mocks for screens
jest.mock('expo-router', () => ({
	Stack: ({ children }: any) => children,
	useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
	useLocalSearchParams: () => ({}),
}));

// Reanimated mock if referenced indirectly
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));


