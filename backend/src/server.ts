import express from "express";
import dotenv from "dotenv";

import userModule from "./services/user";
import orderModule from "./services/order";
import productModule from "./services/product";
import paymentModule from "./services/payment";
import { connectMongo } from "./shared/database/mongo";
import { producer } from "./shared/kafka/producer";

dotenv.config();
const PORT = process.env.HTTP_PORT || 5000;

const app = express();
app.use(express.json());

app.use("/users", userModule);
app.use("/orders", orderModule);
app.use("/products", productModule);
app.use("/payments", paymentModule);

(async () => {
  await connectMongo();
  await producer.connect();

  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
})();
