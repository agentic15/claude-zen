/**
 * Jest Configuration
 * Framework-agnostic configuration supporting React, Vue, Angular, Svelte
 *
 * @version 1.4.4
 * @package agentic15-claude-zen
 */

module.exports = {
  // Use jsdom for DOM testing (React, Vue, Svelte, Angular)
  testEnvironment: 'jsdom',

  // Transform JS/JSX/TS/TSX files with babel-jest
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Support JS, JSX, TS, TSX file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],

  // Find test files in tests/ directory
  testMatch: [
    '**/tests/**/*.test.{js,jsx,ts,tsx}',
    '**/tests/**/*.spec.{js,jsx,ts,tsx}',
  ],

  // Coverage collection
  collectCoverageFrom: [
    'Agent/src/**/*.{js,jsx,ts,tsx}',
    '!Agent/src/**/*.d.ts',
    '!Agent/src/index.{js,ts}',
  ],

  // Setup files for different frameworks
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module name mapper for CSS/asset imports
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/test-site/'],

  // Verbose output
  verbose: true,
};
