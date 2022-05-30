module.exports = {
  moduleDirectories: ['node_modules', './'],
  modulePaths: ['node_modules', './'],
  testEnvironment: 'node',
  preset: 'ts-jest',
  projects: ['<rootDir>/apps/*/jest.config.js'],
};
