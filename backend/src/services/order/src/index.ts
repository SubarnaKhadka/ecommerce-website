import express, { Router } from "express";
import orderRoutes from "./routes/order.route";
import { connectProducer } from "../../../shared/kafka/producer";
import { runOrderConsumer } from "./consumers/order.consumer";

const router = Router();
router.use("/orders", orderRoutes);

const app = express();
app.use(express.json());

const PORT = 3001;
app.listen(PORT, async () => {
  await connectProducer();
  runOrderConsumer();
  console.log(`🚀 Order service running on port ${PORT}`);
});

export default router;
