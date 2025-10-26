import { connectMongo, mongoDb } from "../../../../shared/database/mongo";
import { startConsumer } from "../../../../shared/kafka/consumer";

export async function runUserConsumer() {
  await connectMongo();

  await startConsumer(
    process.env.USER_CONSUMER_GROUP!,
    "user-created",
    async ({ message }) => {
      if (!message.value) return;
      const user = JSON.parse(message.value.toString());

      await mongoDb
        .collection("users")
        .updateOne({ id: user.id }, { $set: user }, { upsert: true });
    }
  );
}
