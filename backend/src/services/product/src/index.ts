import express, { Router } from "express";
import productRoutes from "./routes/product.route";
import { connectProducer } from "../../../shared/kafka/producer";
import { runProductConsumer } from "./consumers/product.consumer";

const app = express();
app.use(express.json());

const router = Router();
router.use("/products", productRoutes);

const PORT = 3003;
app.listen(PORT, async () => {
  await connectProducer();
  runProductConsumer();
  console.log(`🚀 Product service running on port ${PORT}`);
});

export default router;
