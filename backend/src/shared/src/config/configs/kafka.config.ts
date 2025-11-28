import { registerAs } from '../register-as';

export const kafkaConfig = registerAs('kafka', (env) => ({
  kafka_brokers: env.KAFKA_BROKERS,
  kafka_client_id: env.KAFKA_CLIENT_ID,

  order_topic: env.ORDER_TOPIC,
  payment_topic: env.PAYMENT_TOPIC,
  product_topic: env.PRODUCT_TOPIC,
  user_topic: env.USER_TOPIC,
  email_topic: env.EMAIL_TOPIC,

  order_consumer_group: env.ORDER_CONSUMER_GROUP,
  payment_consumer_group: env.PAYMENT_CONSUMER_GROUP,
  product_consumer_group: env.PRODUCT_CONSUMER_GROUP,
  user_consumer_group: env.USER_CONSUMER_GROUP,
  email_consumer_group: env.EMAIL_CONSUMER_GROUP,
}));
