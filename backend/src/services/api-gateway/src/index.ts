import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { requireAuth, config, catchHttpException } from "shared";

const app = express();

const {
  user_service_url,
  order_service_url,
  product_service_url,
  payment_service_url,
} = config.gateway;

const http_port = config.app.port;

app.use(
  "/api/users",
  createProxyMiddleware({
    target: user_service_url,
    changeOrigin: true,
    pathRewrite: { "^/users": "/users" },
    on: {
      error: () => {
        console.log("User service is down");
      },
    },
  })
);

app.use(
  "/api/orders",
  requireAuth,
  createProxyMiddleware({
    target: order_service_url,
    changeOrigin: true,
    pathRewrite: { "^/orders": "/orders" },
  })
);

app.use(
  "/api/products",
  createProxyMiddleware({
    target: product_service_url,
    changeOrigin: true,
    pathRewrite: { "^/products": "/products" },
  })
);

app.use(
  "/api/payments",
  requireAuth,
  createProxyMiddleware({
    target: payment_service_url,
    changeOrigin: true,
    pathRewrite: { "^/payments": "/payments" },
  })
);

app.use(catchHttpException);

app.listen(http_port, () => {
  console.log(`API Gateway running on port ${http_port}`);
});
