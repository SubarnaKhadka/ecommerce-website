import { Router } from "express";
import orderRoutes from "./routes/order.route";

const router = Router();
router.use("/", orderRoutes);

export default router;
