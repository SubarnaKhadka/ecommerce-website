import dotenv from "dotenv";
import app from "./app";

dotenv.config();
const PORT = process.env.HTTP_PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
