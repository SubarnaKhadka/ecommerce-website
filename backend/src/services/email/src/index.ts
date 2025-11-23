import { EMAIL_CLIENT_ID } from "./constants";
import { runEmailConsumer } from "./consumers/email.consumer";

async function bootstrap() {
  await runEmailConsumer(EMAIL_CLIENT_ID);
  console.log("🚀 Email Worker Service Started...");
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function shutdown() {
  process.exit(0);
}

bootstrap();
