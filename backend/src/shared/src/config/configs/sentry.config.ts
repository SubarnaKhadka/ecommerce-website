import { registerAs } from '../register-as';

export const sentryConfig = registerAs('sentry', (env) => ({
  dsn: env.SENTRY_DSN,
}));
