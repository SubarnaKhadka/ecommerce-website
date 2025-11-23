import { initSentry } from "shared";
initSentry();

import express from "express";
import paymentRoutes from "./routes/payment.route";
import { connectProducer, Sentry, catchHttpException } from "shared";
import { runPaymentConsumer } from "./consumers/payment.consumer";
import { PAYMENT_CLIENT_ID } from "./constants";

const app = express();
app.use(express.json());

app.use("/", paymentRoutes);
Sentry.setupExpressErrorHandler(app);
app.use(catchHttpException);

const PORT = 3002;
app.listen(PORT, async () => {
  await connectProducer(PAYMENT_CLIENT_ID);
  runPaymentConsumer(PAYMENT_CLIENT_ID);
  console.log(`🚀 Payment service running on port ${PORT}`);
});
