import { Sentry, initSentry, tenantResolver, transformResponse } from "shared";
initSentry();

import express from "express";
import { connectProducer, catchHttpException } from "shared";
import { runProductConsumer } from "./consumers/product.consumer";
import { PRODUCT_CLIENT_ID } from "./constants";
import { createIndex } from "./services/sync-product.service";

import productRoutes from "./routes/product.route";
import productCategoryRoute from "./routes/product-category.route";
import productVariationRoute from "./routes/product-variation.route";

const app = express();
app.use(express.json());

app.use(tenantResolver);
app.use(transformResponse);
app.use("/category", productCategoryRoute);
app.use("/variants", productVariationRoute);
app.use("/", productRoutes);

Sentry.setupExpressErrorHandler(app);
app.use(catchHttpException);

const PORT = 3003;
app.listen(PORT, async () => {
  await connectProducer(PRODUCT_CLIENT_ID);
  runProductConsumer(PRODUCT_CLIENT_ID);
  await createIndex();
  console.log(`🚀 Product service running on port ${PORT}`);
});
