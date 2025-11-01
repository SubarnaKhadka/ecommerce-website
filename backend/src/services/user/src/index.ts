import express, { Router } from "express";
import userRoutes from "./routes/user.route";
import { connectProducer } from "shared";
import { runUserConsumer } from "./consumers/user.consumer";

const app = express();
app.use(express.json());

app.use("/", userRoutes);

const PORT = 3004;
app.listen(PORT, async () => {
  await connectProducer();
  runUserConsumer();
  console.log(`🚀 User service running on port ${PORT}`);
});
