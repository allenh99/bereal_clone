module.exports = {
	preset: 'jest-expo',
	testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
	setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
	testEnvironment: 'node',
	transform: {},
};


