import { registerAs } from "../register-as";

export const redisConfig = registerAs("redis", (env) => ({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
}));
