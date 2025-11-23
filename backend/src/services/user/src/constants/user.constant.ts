import ms from "ms";
import { config } from "shared";

export const FAILED_KEY_PREFIX = {
  USER: "failed:user",
  IP: "failed:ip",
};
export const BLOCK_SUFFIX = "block";

const { accessExp, failedWindowMinutes, refreshExp } = config.auth;

export const ACCESS_EXPIRES_IN_SECONDS = Number(ms(accessExp)) / 1000;
export const FAILED_WINDOW_SECONDS = failedWindowMinutes * 60;
export const REFRESH_TOKEN_EXP_IN_MILLISECONDS = ms(refreshExp);

export const {
  user_consumer_group: USER_CONSUMER_GROUP,
  order_topic: ORDER_TOPIC,
  user_topic: USER_TOPIC,
  payment_topic: PAYMENT_TOPIC,
  product_topic: PRODUCT_TOPIC,
  email_topic: EMAIL_TOPIC,
} = config.kafka;
export const USER_CLIENT_ID = "user-service";
export const APP_NAME = config.app.name;
