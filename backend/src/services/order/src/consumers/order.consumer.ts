import { connectMongo, mongoDb, startConsumer } from "shared";
import { ORDER_CONSUMER_GROUP, ORDER_TOPIC } from "../constants";

export async function runOrderConsumer(clientId: string) {
  await connectMongo();

  await startConsumer(
    clientId,
    ORDER_CONSUMER_GROUP,
    ORDER_TOPIC,
    async ({ message }) => {
      if (!message.value) return;
      const order = JSON.parse(message.value.toString());

      await mongoDb
        .collection("orders")
        .updateOne({ id: order.id }, { $set: order }, { upsert: true });
    }
  );
}
