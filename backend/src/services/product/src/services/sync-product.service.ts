import { esClient, indexDoc, Sentry } from "shared";

/*
 * Syncing Database with Elastic Search for now is by throwing event
 * which is triggered by product-service producer
 * and consume by consumer listening to PRODUCT_TOPIC
 * TODO: ADD CDC(Change data capture) pipeline which automatically sync database
 * change event to elastic search
 */

import { PRODUCT_INDEX } from "../constants";
import * as productService from "../services/product.service";

export async function createIndex() {
  try {
    const exists = await esClient.indices.exists({ index: PRODUCT_INDEX });

    if (!exists) {
      await esClient.indices.create({
        index: PRODUCT_INDEX,
        mappings: {
          properties: {
            id: { type: "keyword" },
            name: { type: "text" },
            description: { type: "text" },
            product_image: { type: "keyword" },
            category: {
              properties: {
                id: { type: "keyword" },
                category_name: { type: "text" },
              },
            },
            items: {
              type: "nested",
              properties: {
                id: { type: "keyword" },
                sku: { type: "keyword" },
                price: { type: "float" },
                qty_in_stock: { type: "integer" },
                product_image: { type: "keyword" },
                configuration: {
                  type: "nested",
                  properties: {
                    id: { type: "integer" },
                    value: { type: "keyword" },
                    variation_id: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      });
    }
  } catch (err) {
    console.error("Error creating product index in Elasticsearch:", err);
    Sentry.captureException(err);
  }
}

export async function syncElasticProductCreate(productId: number) {
  const esProductDoc = await productService.getProductById(productId);
  await indexDoc(PRODUCT_INDEX, esProductDoc);
}

export async function syncElasticProductUpdate(productId: number) {
  const esProductDoc = await productService.getProductById(productId);
  await indexDoc(PRODUCT_INDEX, esProductDoc);
}
