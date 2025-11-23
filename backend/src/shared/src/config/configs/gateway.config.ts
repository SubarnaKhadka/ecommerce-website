import { registerAs } from "../register-as";

export const gatewayConfig = registerAs("gateway", (env) => ({
  order_service_url: env.ORDER_SERVICE_URL,
  payment_service_url: env.PAYMENT_SERVICE_URL,
  product_service_url: env.PRODUCT_SERVICE_URL,
  user_service_url: env.USER_SERVICE_URL,
}));
