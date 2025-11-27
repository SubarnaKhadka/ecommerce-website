import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: "tests/e2e/**/*.cy.ts",

    baseUrl: "http://localhost:3000/api",

    defaultCommandTimeout: 8000,
    supportFile: false,

    setupNodeEvents(on, config) {
      return config;
    },
  },

  video: true,
  screenshotOnRunFailure: true,
  chromeWebSecurity: false,
});
