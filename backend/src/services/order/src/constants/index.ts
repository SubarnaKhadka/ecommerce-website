import { config } from "shared";

export const {
  order_consumer_group: ORDER_CONSUMER_GROUP,
  order_topic: ORDER_TOPIC,
  user_topic: USER_TOPIC,
  payment_topic: PAYMENT_TOPIC,
  product_topic: PRODUCT_TOPIC,
  email_topic: EMAIL_TOPIC,
} = config.kafka;

export const KAFKA_ORDER_CLIENT_ID = "order-service";
