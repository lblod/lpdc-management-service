module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: { "^.+\\.[t|j]sx?$": "ts-jest" },
  testMatch: ["**/test/**/*.*-test.ts"],
  globalSetup: "./test/test-setup.ts",
  maxWorkers: 1,
  setupFiles: ["dotenv/config"],
  setupFilesAfterEnv: ["jest-extended/all"],
};
