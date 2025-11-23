import { Router } from "express";
import { wrapAllRoutes } from "shared";

const router = Router();
router.get("/", async (_req, res) => {});

export default wrapAllRoutes(router);
