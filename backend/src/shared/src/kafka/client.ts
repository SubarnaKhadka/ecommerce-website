import { Kafka, logLevel } from "kafkajs";
import { config } from "../config";

let kafkaClientInstance: Kafka | null = null;

const { kafka_brokers } = config.kafka;

export function getKafkaClient(clientId: string): Kafka {
  if (!kafkaClientInstance) {
    kafkaClientInstance = new Kafka({
      clientId: clientId,
      brokers: kafka_brokers.split(","),
      logLevel: logLevel.ERROR,
    });
  }
  return kafkaClientInstance;
}
