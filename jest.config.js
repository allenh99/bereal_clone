/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/setupTests.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@react-navigation|expo(nent)?|@expo|expo-.*|react-clone-referenced-element|react-native-svg))',
  ],
  moduleNameMapper: {
    '^expo-router$': '<rootDir>/tests/mocks/expo-router.ts',
    '^expo-file-system/legacy$': '<rootDir>/tests/mocks/expo-file-system.ts',
  },
};


