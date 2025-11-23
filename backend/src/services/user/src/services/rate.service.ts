import { redisClient } from "shared";
import {
  BLOCK_SUFFIX,
  FAILED_KEY_PREFIX,
  FAILED_WINDOW_SECONDS,
} from "../constants/user.constant";

export function failedKey(type: "user" | "ip", value?: string) {
  const prefix =
    type === "user" ? FAILED_KEY_PREFIX.USER : FAILED_KEY_PREFIX.IP;
  return `${prefix}:${value}`;
}

export function blockMarkerKey(baseKey: string) {
  return `${baseKey}:${BLOCK_SUFFIX}`;
}

export async function incrementFailedCount(baseKey: string) {
  const count = await redisClient.incr(baseKey);
  if (count === 1) {
    await redisClient.expire(baseKey, FAILED_WINDOW_SECONDS);
  }
  return Number(count);
}

export async function getFailedCount(baseKey: string) {
  const v = await redisClient.get(baseKey);
  return v ? parseInt(v, 10) : 0;
}

export async function blockKey(baseKey: string, minutes: number) {
  await redisClient.set(blockMarkerKey(baseKey), "1", "EX", minutes * 60);
}

export async function isBlockedKey(baseKey: string | null) {
  if (!baseKey) return;
  const val = await redisClient.get(blockMarkerKey(baseKey));
  return val === "1";
}

export async function resetFailedCount(baseKey: string) {
  await redisClient.del(baseKey);
}
