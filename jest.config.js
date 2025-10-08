module.exports = {
	preset: 'jest-expo',
	testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
	setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
	testEnvironment: 'node',
  moduleNameMapper: {
    '^expo-file-system/legacy$': '<rootDir>/__mocks__/expo-file-system.ts',
    '^expo-camera$': '<rootDir>/__mocks__/expo-camera.ts',
    '^expo-notifications$': '<rootDir>/__mocks__/expo-notifications.ts',
    '^expo-crypto$': '<rootDir>/__mocks__/expo-crypto.ts',
  },
};


