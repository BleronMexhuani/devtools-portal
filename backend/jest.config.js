/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
  // Increase timeout for mongodb-memory-server startup
  testTimeout: 30000,
  // Load env variables before all tests
  setupFiles: ['<rootDir>/src/__tests__/envSetup.ts'],
};
