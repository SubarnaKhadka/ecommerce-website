import express, { Router } from "express";
import paymentRoutes from "./routes/payment.route";
import { connectProducer } from "shared";
import { runPaymentConsumer } from "./consumers/payment.consumer";

const app = express();
app.use(express.json());

app.use("/", paymentRoutes);

const PORT = 3002;
app.listen(PORT, async () => {
  await connectProducer();
  runPaymentConsumer();
  console.log(`🚀 Payment service running on port ${PORT}`);
});
