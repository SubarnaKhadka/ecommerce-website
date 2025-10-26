import { Router } from "express";
import userRoutes from "./routes/user.route";

const router = Router();
router.use("/", userRoutes);

export default router;
