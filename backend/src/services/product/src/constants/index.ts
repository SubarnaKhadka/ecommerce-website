import { config } from "shared";

export const {
  product_consumer_group: PRODUCT_CONSUMER_GROUP,
  order_topic: ORDER_TOPIC,
  user_topic: USER_TOPIC,
  payment_topic: PAYMENT_TOPIC,
  product_topic: PRODUCT_TOPIC,
  email_topic: EMAIL_TOPIC,
} = config.kafka;

export const PRODUCT_INDEX = "products";
export const PRODUCT_CLIENT_ID = "product-service";
