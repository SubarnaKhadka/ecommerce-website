import type { Producer } from 'kafkajs';

import { Sentry } from '../sentry';
import { getKafkaClient } from './client';

let producerInstance: Producer | null = null;

export async function connectProducer(clientId: string) {
  if (!producerInstance) {
    const kafka = getKafkaClient(clientId);
    const producer = kafka.producer();
    await producer.connect();
    producerInstance = producer;
    console.log('✅ Kafka Producer connected');
  }
}

export function getProducer() {
  if (!producerInstance) throw new Error('Producer not connected. Call connectProducer() first.');
  return producerInstance;
}

export async function emitEvent(topic: string, message: any) {
  const producer = getProducer();
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { topic },
      extra: { message },
    });
  }
}
