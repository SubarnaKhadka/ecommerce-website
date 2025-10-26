import { Router } from "express";
import productRoutes from "./routes/product.route";

const router = Router();
router.use("/", productRoutes);

export default router;
