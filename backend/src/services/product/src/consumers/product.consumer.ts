import { startConsumer, indexBulkDoc, deleteDocFromIndex } from "shared";
import {
  PRODUCT_CONSUMER_GROUP,
  PRODUCT_INDEX,
  PRODUCT_TOPIC,
} from "../constants";
import * as syncElasticProductService from "../services/sync-product.service";
import { PRODUCT_EVENT } from "../enums/product-event.enum";

export async function runProductConsumer(clientId: string) {
  await startConsumer(
    clientId,
    PRODUCT_CONSUMER_GROUP,
    PRODUCT_TOPIC,
    async ({ message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString());

      switch (event.type) {
        case PRODUCT_EVENT.SYNC_ELASTIC_PRODUCTS_INSERT: {
          await syncElasticProductService.syncElasticProductCreate(
            event.data.id
          );
          break;
        }

        case PRODUCT_EVENT.SYNC_ELASTIC_BULK_PRODUCTS_INSERT: {
          await indexBulkDoc(PRODUCT_INDEX, event.data);
          break;
        }

        case PRODUCT_EVENT.SYNC_ELASTIC_PRODUCTS_UPDATE: {
          await syncElasticProductService.syncElasticProductUpdate(
            event.data.id
          );
          break;
        }

        case PRODUCT_EVENT.SYNC_ELASTIC_PRODUCTS_DELETE: {
          await deleteDocFromIndex(PRODUCT_INDEX, event.data.id);
        }
      }
    }
  );
}
