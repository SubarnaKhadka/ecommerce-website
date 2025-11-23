import Redis from "ioredis";
import { config } from "../config";

const { host, port } = config.redis;
const redisClient = new Redis({
  host,
  port,
  retryStrategy(times) {
    console.error("Redis retry attempt:", times);
    return 1000;
  },
});

export { redisClient };
