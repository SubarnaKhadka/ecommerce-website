import { kafka } from "./client";

export const TOPICS = {
  orders: process.env.ORDER_TOPIC!,
  payments: process.env.PAYMENT_TOPIC!,
  products: process.env.PRODUCT_TOPIC!,
  users: process.env.USER_TOPIC!,
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
