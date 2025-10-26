import express, { Router } from "express";
import orderRoutes from "./routes/payment.route";
import { connectProducer } from "../../../shared/kafka/producer";
import { runPaymentConsumer } from "./consumers/payment.consumer";

const app = express();
app.use(express.json());

const router = Router();
router.use("/payments", orderRoutes);

const PORT = 3002;
app.listen(PORT, async () => {
  await connectProducer();
  runPaymentConsumer();
  console.log(`🚀 Payment service running on port ${PORT}`);
});

export default router;
