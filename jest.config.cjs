module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^\\.\\./locations\\.md\\?raw$': '<rootDir>/locations.md',
    '^\\.\\./locations\\.en\\.md\\?raw$': '<rootDir>/locations.en.md',
    '^\\./baseUrl$': '<rootDir>/src/test/baseUrlMock.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
          target: 'es2022',
        },
        module: {
          type: 'commonjs',
        },
      },
    ],
    '^.+\\.md$': '<rootDir>/src/test/rawMarkdownTransformer.cjs',
  },
}
