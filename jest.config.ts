import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Path to Next.js app to load next.config.js and .env files
  dir: "./",
});

// Jest configuration
const config: Config = {
  displayName: "haderech",
  setupFilesAfterEnv: ["<rootDir>/src/tests/utils/setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: [
    "<rootDir>/src/tests/unit/**/*.test.ts",
    "<rootDir>/src/tests/unit/**/*.test.tsx",
    "<rootDir>/src/tests/integration/**/*.test.ts",
    "<rootDir>/src/tests/integration/**/*.test.tsx",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|sass|scss)$": "<rootDir>/src/tests/mocks/styleMock.ts",
    "\\.(gif|ttf|eot|svg|png|jpg|jpeg)$":
      "<rootDir>/src/tests/mocks/fileMock.ts",
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/tests/**/*",
    "!src/types/**/*",
    "!src/styles/**/*",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // Custom reporters
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "coverage/junit",
        outputName: "junit.xml",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
      },
    ],
  ],
  // Custom test environment options
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  // Transform configuration
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};

export default createJestConfig(config);
