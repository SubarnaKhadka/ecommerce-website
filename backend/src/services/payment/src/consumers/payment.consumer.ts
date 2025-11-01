import { connectMongo, mongoDb, startConsumer } from "shared";

export async function runPaymentConsumer() {
  await connectMongo();

  await startConsumer(
    process.env.PAYMENT_CONSUMER_GROUP!,
    process.env.PAYMENT_TOPIC!,
    async ({ message }) => {
      if (!message.value) return;
      const order = JSON.parse(message.value.toString());

      await mongoDb
        .collection("orders")
        .updateOne({ id: order.id }, { $set: order }, { upsert: true });
    }
  );
}
