import { connectMongo, mongoDb, startConsumer } from "shared";
import { UserEvent } from "../enums/user-event.enum";
import { USER_CONSUMER_GROUP, USER_TOPIC } from "../constants/user.constant";

export async function runUserConsumer(clientId: string) {
  await connectMongo();

  await startConsumer(
    clientId,
    USER_CONSUMER_GROUP,
    USER_TOPIC,
    async ({ message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString());

      switch (event.type) {
        case UserEvent.USER_FAILED_LOGIN: {
          await mongoDb.collection("failed_logins").insertOne(event.data);
          break;
        }
      }
    }
  );
}
