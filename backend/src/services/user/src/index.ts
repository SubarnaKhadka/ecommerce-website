import express, { Router } from "express";
import userRoutes from "./routes/user.route";
import { connectProducer } from "../../../shared/kafka/producer";
import { runUserConsumer } from "./consumers/user.consumer";

const app = express();
app.use(express.json());

const router = Router();
router.use("/users", userRoutes);

const PORT = 3004;
app.listen(PORT, async () => {
  await connectProducer();
  runUserConsumer();
  console.log(`🚀 Product service running on port ${PORT}`);
});

export default router;
