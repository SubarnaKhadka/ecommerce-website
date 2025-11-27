import { initSentry, tenantResolver } from "shared";
initSentry();

import express from "express";
import orderRoutes from "./routes/order.route";
import {
  connectProducer,
  requireAuth,
  catchHttpException,
  Sentry,
} from "shared";
import { runOrderConsumer } from "./consumers/order.consumer";
import { KAFKA_ORDER_CLIENT_ID } from "./constants";

const app = express();
app.use(express.json());

app.use(tenantResolver);
app.use("/", requireAuth, orderRoutes);
Sentry.setupExpressErrorHandler(app);
app.use(catchHttpException);

const PORT = 3001;
app.listen(PORT, async () => {
  await connectProducer(KAFKA_ORDER_CLIENT_ID);
  runOrderConsumer(KAFKA_ORDER_CLIENT_ID);
  console.log(`🚀 Order service running on port ${PORT}`);
});
