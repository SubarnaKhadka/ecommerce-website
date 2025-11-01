import { kafka } from "./client";

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
