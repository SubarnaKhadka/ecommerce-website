import { Kafka, EachMessagePayload } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: process.env.KAFKA_BROKERS!.split(","),
});

export async function startConsumer(
  groupId: string,
  topic: string,
  eachMessageHandler: (payload: EachMessagePayload) => Promise<void>
) {
  const consumer = kafka.consumer({ groupId });

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async (payload) => {
      try {
        await eachMessageHandler(payload);
      } catch (err) {
        console.error("❌ Error processing Kafka message:", err);
      }
    },
  });

  console.log(`✅ Kafka consumer running for topic: ${topic}`);
}
