import { appConfig } from './app.config';
import { authConfig } from './auth.config';
import { databaseConfig } from './database.config';
import { esConfig } from './elasticsearch.config';
import { emailConfig } from './email.config';
import { gatewayConfig } from './gateway.config';
import { kafkaConfig } from './kafka.config';
import { redisConfig } from './redis.config';
import { sentryConfig } from './sentry.config';

export default [
  authConfig,
  appConfig,
  databaseConfig,
  gatewayConfig,
  kafkaConfig,
  redisConfig,
  sentryConfig,
  emailConfig,
  esConfig,
];
