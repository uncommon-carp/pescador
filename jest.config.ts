import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,

  // Tell Jest to look for source and test files in these directories
  roots: ['<rootDir>/services', '<rootDir>/libs'],

  // Ignore the web-ui app from test runs completely
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/apps/web-ui/', '/.serverless/'],

  // Enable code coverage collection
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: '<rootDir>/coverage',

  // Collect coverage from all .ts files within services and libs,
  // but exclude specific patterns
  collectCoverageFrom: ['services/**/*.ts', 'libs/**/*.ts'],

  // Ignore specific files and directories from coverage reporting
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'jest.config.ts',
    '/.serverless/',
    // Exclude interface-only packages as there is no logic to test
    '<rootDir>/libs/interfaces/',
    // Exclude test files themselves from coverage
    '.test.ts',
    '.spec.ts',
  ],

  // A map for Jest to resolve non-relative paths (like in a monorepo)
  // This helps if you use path aliases like `@pescador/errors`
  moduleNameMapper: {
    '^@pescador/errors/(.*)$': '<rootDir>/libs/errors/$1',
    '^@pescador/interfaces/(.*)$': '<rootDir>/libs/interfaces/$1',
    '^@pescador/utils/(.*)$': '<rootDir>/libs/utils/$1',
  },
};

export default config;
