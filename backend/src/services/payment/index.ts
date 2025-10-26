import { Router } from "express";
import paymentRoutes from "./routes/payment.route";

const router = Router();
router.use("/", paymentRoutes);

export default router;
