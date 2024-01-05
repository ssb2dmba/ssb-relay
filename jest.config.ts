import type {Config} from '@jest/types';
// Sync object
const config: Config.InitialOptions = {
  globalSetup: "./jestGlobalSetup.js",
  verbose: true,
  transform: {
  "^.+\\.tsx?$": "ts-jest",
  },
};
export default config;