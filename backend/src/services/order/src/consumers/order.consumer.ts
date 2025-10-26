import { connectMongo, mongoDb } from "../../../../shared/database/mongo";
import { startConsumer } from "../../../../shared/kafka/consumer";

export async function runOrderConsumer() {
  await connectMongo();

  await startConsumer(
    process.env.ORDER_CONSUMER_GROUP!,
    "order-created",
    async ({ message }) => {
      if (!message.value) return;
      const order = JSON.parse(message.value.toString());

      await mongoDb
        .collection("orders")
        .updateOne({ id: order.id }, { $set: order }, { upsert: true });
    }
  );
}
