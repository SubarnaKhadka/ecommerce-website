import express, { Router } from "express";
import orderRoutes from "./routes/order.route";
import { connectProducer } from "shared";
import { runOrderConsumer } from "./consumers/order.consumer";

const app = express();
app.use(express.json());

app.use("/", orderRoutes);

const PORT = 3001;
app.listen(PORT, async () => {
  await connectProducer();
  runOrderConsumer();
  console.log(`🚀 Order service running on port ${PORT}`);
});
