import '@testing-library/jest-native/extend-expect';

// Stable time for predictable filenames and timers
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));

// Deterministic randomness
jest.spyOn(global.Math, 'random').mockReturnValue(0.1234);

// Expo module mocks
jest.mock('expo-file-system', () => require('../mocks/expo-file-system'));
jest.mock('expo-camera', () => require('../mocks/expo-camera'));
jest.mock('expo-notifications', () => require('../mocks/expo-notifications'));
jest.mock('expo-crypto', () => require('../mocks/expo-crypto'));
jest.mock('expo-router', () => require('../mocks/expo-router'));


