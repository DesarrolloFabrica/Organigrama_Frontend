import { defineConfig } from "@playwright/test";

const baseURL = process.env.SMOKE_FRONTEND_URL ?? "http://localhost:5173";

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "e2e/smoke-results.json" }]],
  use: {
    baseURL,
    headless: true,
    trace: "off",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
