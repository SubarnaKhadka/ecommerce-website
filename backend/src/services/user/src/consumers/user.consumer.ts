import { connectMongo, mongoDb } from "shared";
import { startConsumer } from "shared";

export async function runUserConsumer() {
  await connectMongo();

  await startConsumer(
    process.env.USER_CONSUMER_GROUP!,
    process.env.USER_TOPIC!,
    async ({ message }) => {
      if (!message.value) return;
      const user = JSON.parse(message.value.toString());

      await mongoDb
        .collection("users")
        .updateOne({ id: user.id }, { $set: user }, { upsert: true });
    }
  );
}
