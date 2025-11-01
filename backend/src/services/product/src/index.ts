import express, { Router } from "express";
import { connectProducer } from "shared";
import productRoutes from "./routes/product.route";
import { runProductConsumer } from "./consumers/product.consumer";

const app = express();
app.use(express.json());

app.use("/", productRoutes);

const PORT = 3003;
app.listen(PORT, async () => {
  await connectProducer();
  runProductConsumer();
  console.log(`🚀 Product service running on port ${PORT}`);
});
