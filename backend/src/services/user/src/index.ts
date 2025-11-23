import { initSentry } from "shared";
initSentry();

import express from "express";

import {
  catchHttpException,
  connectProducer,
  transformResponse,
  Sentry,
} from "shared";
import userRoutes from "./routes/user.route";
import { runUserConsumer } from "./consumers/user.consumer";
import { USER_CLIENT_ID } from "./constants/user.constant";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(transformResponse);
app.use("/", userRoutes);
Sentry.setupExpressErrorHandler(app);

app.use(catchHttpException);

const PORT = 3004;
app.listen(PORT, async () => {
  await connectProducer(USER_CLIENT_ID);
  runUserConsumer(USER_CLIENT_ID);
  console.log(`🚀 User service running on port ${PORT}`);
});
