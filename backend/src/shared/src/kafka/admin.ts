import { Kafka } from "kafkajs";
import { config } from "../config";

const {
  order_topic,
  payment_topic,
  product_topic,
  user_topic,
  email_topic,
  kafka_client_id,
  kafka_brokers,
} = config.kafka;

const kafka = new Kafka({
  clientId: kafka_client_id,
  brokers: kafka_brokers?.split(","),
});

export const TOPICS = {
  orders: order_topic,
  payments: payment_topic,
  products: product_topic,
  users: user_topic,
  emails: email_topic,
};

export async function createTopics() {
  const admin = kafka.admin();
  await admin.connect();

  const topicsToCreate = Object.values(TOPICS).map((topic) => ({
    topic,
    numPartitions: 1,
    replicationFactor: 1,
  }));

  const existingTopics = await admin.listTopics();

  for (const t of topicsToCreate) {
    if (!existingTopics.includes(t.topic)) {
      console.log(`Creating topic: ${t.topic}`);
      await admin.createTopics({ topics: [t] });
    }
  }

  await admin.disconnect();
}

createTopics();
