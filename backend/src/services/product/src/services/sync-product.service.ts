import { esClient, indexBulkDoc, Sentry } from "shared";

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
            price: { type: "float" },
            stock: { type: "integer" },
            sku: { type: "keyword" },
            product: {
              properties: {
                name: { type: "text" },
                slug: {
                  type: "keyword",
                  fields: {
                    text: { type: "text", analyzer: "standard" },
                  },
                },
                description: { type: "text" },
                category: { type: "keyword" },
              },
            },
            configuration: {
              type: "nested",
              properties: {
                id: { type: "integer" },
                value: { type: "keyword" },
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

export async function syncElasticProductUpdate(productId: number) {
  const esProductDoc = [];

  const products = await productService.getProductById(productId);
  console.log();
  const { name, slug, items, category, description } = products;

  for (const item of items ?? []) {
    const esConfiguration = [];
    for (const config of item?.configuration ?? []) {
      esConfiguration.push({
        id: config.id,
        value: config.value,
      });
    }
    esProductDoc.push({
      id: item.id,
      sku: item.sku,
      price: Number(item.price),
      stock: item.qty_in_stock,
      product: {
        name: name,
        slug: slug,
        description: description,
        category: category?.category_name,
      },
      configuration: esConfiguration,
    });
  }
  await indexBulkDoc(PRODUCT_INDEX, esProductDoc);
}
