import type { Config } from "@jest/types";
// Sync object
const config: Config.InitialOptions = {
  globalSetup: "./jestGlobalSetup.cjs",
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
export default config;
