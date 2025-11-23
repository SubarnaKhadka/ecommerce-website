import { Router } from "express";
import { wrapAllRoutes } from "shared";

const router = Router();

router.get("/", async (req, res) => {
  res.json({ message: "order" });
});

export default wrapAllRoutes(router);
