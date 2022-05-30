module.exports = {
  name: 'captcha',
  displayName: 'captcha',
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
