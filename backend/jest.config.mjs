import { createDefaultEsmPreset } from "ts-jest";

const preset = createDefaultEsmPreset();

/** @type {import("jest").Config} */
const shared = {
  ...preset,
  testEnvironment: "node",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.ts$": "$1",
  },
};

/** @type {import("jest").Config} */
const config = {
  projects: [
    {
      ...shared,
      displayName: "unit",
      testMatch: ["<rootDir>/tests/**/*.spec.ts"],
    },
    {
      ...shared,
      displayName: "e2e",
      testMatch: ["<rootDir>/tests/**/*.e2e-spec.ts"],
      testTimeout: 30_000,
    },
  ],
};

export default config;
