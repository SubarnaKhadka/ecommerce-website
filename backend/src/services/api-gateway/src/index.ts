import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import * as dotenv from "dotenv";
import path from "path";

// load root env
const envPath = path.resolve(__dirname, "../../../../.env.local");
dotenv.config({ path: envPath });

const app = express();

app.use(express.json());

app.use(
  "/api/users",
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/users": "/users" },
  })
);

app.use(
  "/api/orders",
  createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/orders": "/orders" },
  })
);

app.use(
  "/api/products",
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/products": "/products" },
  })
);

app.use(
  "/api/payments",
  createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/payments": "/payments" },
  })
);

const PORT = process.env.HTTP_PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
