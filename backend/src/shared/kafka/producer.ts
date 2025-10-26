import { Kafka } from "kafkajs";
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: process.env.KAFKA_BROKERS!.split(","),
});

export const producer = kafka.producer();

export async function connectProducer() {
  await producer.connect();
  console.log("✅ Kafka Producer connected");
}

export async function emitEvent(topic: string, message: any) {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
}
