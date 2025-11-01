import { connectMongo, mongoDb } from "shared";
import { startConsumer } from "shared";

export async function runProductConsumer() {
  await connectMongo();

  await startConsumer(
    process.env.PRODUCT_CONSUMER_GROUP!,
    process.env.PRODUCT_TOPIC!,
    async ({ message }) => {
      if (!message.value) return;
      const product = JSON.parse(message.value.toString());

      await mongoDb
        .collection("products")
        .updateOne({ id: product.id }, { $set: product }, { upsert: true });
    }
  );
}
