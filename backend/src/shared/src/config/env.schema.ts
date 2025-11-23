import z from "zod";

export const envSchema = z.object({
  HTTP_PORT: z.preprocess((val) => Number(val), z.number()).default(3000),
  APP_ENV: z.enum(["development", "production", "test"]).default("development"),
  APP_NAME: z.string(),

  JWT_ISSUER: z.string().default("ecommerce-website"),
  ACCESS_TOKEN_EXP: z.string().default("15m"),
  REFRESH_TOKEN_EXP: z.string().default("14d"),
  SECRET_KEY: z.string(),
  MAX_FAILED_ATTEMPT: z
    .preprocess((val) => Number(val), z.number())
    .default(10),
  BLOCK_MINUTES: z.preprocess((val) => Number(val), z.number()).default(15),
  FAILED_WINDOW_MINUTES: z
    .preprocess((val) => Number(val), z.number())
    .default(15),

  DB_HOST: z.string(),
  DB_PORT: z.preprocess((val) => Number(val), z.number()).default(5432),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  MONGO_URI: z.string(),
  MONGO_DB_NAME: z.string(),

  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.preprocess((val) => Number(val), z.number()).default(6379),

  SENTRY_DSN: z.string(),

  EMAIL_USER: z.email(),
  EMAIL_PASS: z.string(),

  KAFKA_BROKERS: z.string(),
  KAFKA_CLIENT_ID: z.string(),

  ELASTIC_URL: z.string(),
  ELASTIC_USER: z.string(),
  ELASTIC_PASSWORD: z.string(),

  ORDER_TOPIC: z.string(),
  PAYMENT_TOPIC: z.string(),
  PRODUCT_TOPIC: z.string(),
  USER_TOPIC: z.string(),
  EMAIL_TOPIC: z.string(),

  ORDER_CONSUMER_GROUP: z.string(),
  PAYMENT_CONSUMER_GROUP: z.string(),
  PRODUCT_CONSUMER_GROUP: z.string(),
  USER_CONSUMER_GROUP: z.string(),
  EMAIL_CONSUMER_GROUP: z.string(),

  ORDER_SERVICE_URL: z.string(),
  PAYMENT_SERVICE_URL: z.string(),
  PRODUCT_SERVICE_URL: z.string(),
  USER_SERVICE_URL: z.string(),
});
