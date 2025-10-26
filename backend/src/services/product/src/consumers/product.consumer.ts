import { connectMongo, mongoDb } from "../../../../shared/database/mongo";
import { startConsumer } from "../../../../shared/kafka/consumer";

export async function runProductConsumer() {
  await connectMongo();

  await startConsumer(
    process.env.PRODUCT_CONSUMER_GROUP!,
    "product-created",
    async ({ message }) => {
      if (!message.value) return;
      const product = JSON.parse(message.value.toString());

      await mongoDb
        .collection("products")
        .updateOne({ id: product.id }, { $set: product }, { upsert: true });
    }
  );
}
