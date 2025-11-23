import { config } from "shared";
export const {
  email_consumer_group: EMAIL_CONSUMER_GROUP,
  order_topic: ORDER_TOPIC,
  user_topic: USER_TOPIC,
  payment_topic: PAYMENT_TOPIC,
  product_topic: PRODUCT_TOPIC,
  email_topic: EMAIL_TOPIC,
} = config.kafka;

export const EMAIL_CLIENT_ID = "email-service";
