module.exports = {
  preset: 'react-scripts',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/api/(.*)$': '<rootDir>/src/api/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/features/(.*)$': '<rootDir>/src/features/$1',
    '^@/pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/index.tsx',
    '!src/setupTests.ts',
    '!src/reportWebVitals.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/tests/e2e/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/e2e/'],
  transformIgnorePatterns: [
    'node_modules/(?!axios)',
  ],
};
