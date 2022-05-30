module.exports = {
  name: 'bot-core',
  displayName: 'bot-core',
  globals: {
    'ts-jest': {
      baseUrl: '.',
    },
  },
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  modulePaths: ['<rootDir>', './src/'],
  rootDir: '.',
  testTimeout: 20000,
};
