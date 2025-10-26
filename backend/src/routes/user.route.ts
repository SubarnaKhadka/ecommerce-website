import { Router } from "express";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    res.json({ message: "hello users" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
