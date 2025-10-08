import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Important: We rely on jest.config.js moduleNameMapper to provide concrete manual mocks
// for expo-file-system/legacy, expo-crypto, expo-notifications, and expo-camera.
// Do NOT call jest.mock(...) for those here, or Jest will auto-mock and strip our helpers.

// Router mocks for screens
jest.mock('expo-router', () => ({
	Stack: ({ children }: any) => children,
	useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
	useLocalSearchParams: () => ({}),
}));

// Reanimated mock if referenced indirectly
jest.mock('react-native-reanimated', () => {
	const ReanimatedMock = {
		__esModule: true,
		default: {
			createAnimatedComponent: (c: any) => c,
		},
		Easing: {},
		useSharedValue: (v: any) => ({ value: v }),
		useAnimatedStyle: () => ({}),
		withTiming: (toValue: any) => toValue,
		withSpring: (toValue: any) => toValue,
		runOnJS: (fn: any) => fn,
		runOnUI: (fn: any) => fn,
		createAnimatedComponent: (c: any) => c,
	};
	return ReanimatedMock;
});


