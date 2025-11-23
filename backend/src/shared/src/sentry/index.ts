import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { config } from "../config";

let initialized = false;

export function initSentry() {
  if (initialized) return;

  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.app.app_env,
    integrations: [nodeProfilingIntegration()],
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
  });

  initialized = true;
}

export { Sentry };
