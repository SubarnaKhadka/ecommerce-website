import { connectMongo, mongoDb, startConsumer } from "shared";
import { PAYMENT_CONSUMER_GROUP, PAYMENT_TOPIC } from "../constants";

export async function runPaymentConsumer(clientId: string) {
  await connectMongo();

  await startConsumer(
    clientId,
    PAYMENT_CONSUMER_GROUP,
    PAYMENT_TOPIC,
    async ({ message }) => {
      if (!message.value) return;
      const order = JSON.parse(message.value.toString());

      await mongoDb
        .collection("orders")
        .updateOne({ id: order.id }, { $set: order }, { upsert: true });
    }
  );
}
