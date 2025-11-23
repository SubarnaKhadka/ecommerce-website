import { Sentry, startConsumer } from "shared";
import { sendMail } from "../services/email.service";
import { EMAIL_CONSUMER_GROUP, EMAIL_TOPIC } from "../constants";

export async function runEmailConsumer(clientId: string) {
  await startConsumer(
    clientId,
    EMAIL_CONSUMER_GROUP,
    EMAIL_TOPIC,
    async ({ message }) => {
      if (!message.value) return;

      const {
        to,
        subject,
        message: emailMessage,
        options = {},
      } = JSON.parse(message.value.toString());

      try {
        await sendMail({ to, subject, message: emailMessage, options });
      } catch (err) {
        Sentry.captureException(err);
      }
    }
  );
}
