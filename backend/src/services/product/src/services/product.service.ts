import {
  BadRequestException,
  ConflictException,
  emitEvent,
  esClient,
  ICreated,
  IDeleted,
  IPaginationRequest,
  IPaginationResult,
  IUpdated,
  NotFoundException,
  pgPool,
  Sentry,
} from "shared";
import { PoolClient } from "pg";

import * as productModel from "../models/product.model";
import * as productVariantModel from "../models/product-variant.model";
import * as productCategoryModel from "../models/product-category.model";
import * as productHelper from "../helpers/product.helper";

import { PRODUCT_INDEX, PRODUCT_TOPIC } from "../constants";
import { PRODUCT_EVENT } from "../enums/product-event.enum";
import {
  IProduct,
  IProductConfiguration,
  IProductItem,
} from "../interfaces/product.interface";

export async function getAllProducts({
  page,
  limit,
}: IPaginationRequest): Promise<IPaginationResult<IProduct>> {
  return await productModel.getAllProducts({ page, limit });
}

export async function getProductById(id: number): Promise<IProduct> {
  const existingProduct = await productModel.getProductWithCategoryById(id);
  if (!existingProduct) {
    throw new NotFoundException("Product not found");
  }

  const variations = await productVariantModel.getVariationsByCategoryId(
    existingProduct.category.id
  );

  const productItems = await productModel.getProductItemsByProductId(
    existingProduct.id
  );
  const productItemIds = productItems.map((i) => i.id);

  const configurations = await productModel.getConfigurationsByProductItemIds(
    productItemIds
  );

  const configsMap = Object.fromEntries(
    configurations.map((row) => [row.product_item_id, row.configurations])
  ) as Record<number, (typeof configurations)[0]["configurations"]>;

  const configuredProductItems = productItems.map((item) => ({
    ...item,
    configuration: configsMap[item.id] || [],
  }));

  return {
    ...existingProduct,
    variations,
    items: configuredProductItems,
  };
}

export async function createProduct({
  name,
  description,
  brand,
  image,
  categoryId,
  items,
}: IProduct): Promise<ICreated> {
  const client = await pgPool.connect();

  try {
    await client.query("BEGIN");
    const existingCategory = await productCategoryModel.getCategoryById(
      categoryId,
      { client }
    );
    if (!existingCategory) {
      throw new BadRequestException("Invalid Category");
    }

    const { slug } = productHelper.generateSlug(name, { allowRandom: true });
    const createdProduct = await productModel.createProduct(
      {
        categoryId: existingCategory.id,
        name,
        slug,
        description,
        brand,
        image,
      },
      { client }
    );

    for (const item of items ?? []) {
      const existingSku = await productModel.getProductItemBySku(item.sku, {
        client,
      });

      if (existingSku) {
        throw new ConflictException(`SKU ${item.sku} already exists`);
      }
      const createdProductItem = await productModel.createProductItem(
        {
          sku: item.sku,
          price: item.price,
          qty_in_stock: item.qty_in_stock,
          product_image: item.product_image,
          productId: createdProduct.id,
        },
        { client }
      );

      for (const config of item.configuration ?? []) {
        const variationOptionId = config.variation_option_id;

        const existingVariationOption =
          await productVariantModel.getVariationOptionById(variationOptionId, {
            client,
          });

        if (!existingVariationOption) {
          throw new BadRequestException("Variation option not found");
        }

        await productModel.createProductConfiguration(
          createdProductItem?.id,
          existingVariationOption?.variation_id,
          variationOptionId,
          { client }
        );
      }
    }
    await client.query("COMMIT");

    emitEvent(PRODUCT_TOPIC, {
      type: PRODUCT_EVENT.SYNC_ELASTIC_PRODUCTS_INSERT,
      data: {
        id: createdProduct.id,
      },
    });

    return { id: createdProduct.id };
  } catch (err) {
    await client.query("ROLLBACK");
    Sentry.captureException(err);
    throw err;
  } finally {
    client.release();
  }
}

export async function updateProductConfiguration(
  categoryId: number,
  productItemId: number,
  configuration: IProductConfiguration[],
  options?: { client?: PoolClient }
): Promise<void> {
  const idsToUpdate = configuration.filter((c) => c.id).map((c) => c.id);
  if (idsToUpdate.length < 1) return;

  const existingConfigs = await productModel.getConfigurationsByIds(
    idsToUpdate,
    options
  );
  const existingConfigIdSet = new Set(existingConfigs.map((c) => Number(c.id)));

  for (const config of configuration) {
    if (!config.id) continue;

    if (!existingConfigIdSet.has(config.id)) {
      throw new BadRequestException("Variation not found");
    }

    if (config.variation_option_id) {
      const variationOption = await productVariantModel.getVariationOptionById(
        config.variation_option_id,
        options
      );

      if (!variationOption) {
        throw new BadRequestException("Variation option not found");
      }

      const variationFromOption = await productVariantModel.getVariantById(
        variationOption.variation_id,
        options
      );

      if (variationFromOption.category_id != categoryId) {
        throw new BadRequestException(
          "Variant doesnot lies on this product category"
        );
      }

      await productModel.updateProductConfiguration(
        config.id,
        productItemId,
        config.variation_option_id
      );
    }
  }
}

export async function updateProductItems(
  categoryId: number,
  items: IProductItem[],
  options?: { client?: PoolClient }
): Promise<void> {
  const idsToUpdate = items.filter((i) => i.id).map((i) => i.id);
  if (idsToUpdate.length < 1) return;

  const existingItems = await productModel.getProductItemsByIds(
    idsToUpdate,
    options
  );
  const existingItemIdSet = new Set(existingItems.map((i) => Number(i.id)));

  for (const item of items) {
    if (!item.id) continue;

    if (!existingItemIdSet.has(item.id)) {
      throw new BadRequestException("Product item not found");
    }

    if (item.sku) {
      const isSkuAlreadyTaken = await productModel.checkSkuAlreadyExists(
        item.sku,
        item.id
      );
      if (isSkuAlreadyTaken) {
        throw new ConflictException("Sku already taken");
      }
    }

    await productModel.updateProductItem(
      item.id,
      {
        sku: item.sku,
        price: item.price,
        qty_in_stock: item.qty_in_stock,
        product_image: item.product_image,
      },
      options
    );

    if (item.configuration?.length) {
      await updateProductConfiguration(
        categoryId,
        item.id,
        item?.configuration,
        options
      );
    }
  }
}

export async function updateProduct({
  id,
  name,
  description,
  image,
  brand,
  items,
  categoryId,
}: Partial<IProduct>): Promise<IUpdated> {
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");
    const existingproduct = await productModel.getProductById(id, { client });
    if (!existingproduct) {
      throw new NotFoundException("Product not found");
    }

    if (categoryId) {
      const [existingCategory, productItems] = await Promise.all([
        productCategoryModel.getCategoryById(categoryId, { client }),
        productModel.getProductItemsByProductId(id, { client }),
      ]);
      if (!existingCategory) {
        throw new BadRequestException("Category not found");
      }

      if (productItems?.length > 0) {
        throw new BadRequestException(
          "Cannot change category because product has variants/items"
        );
      }
    }

    if (items?.length) {
      await updateProductItems(existingproduct.category_id, items, { client });
    }

    await productModel.updateProduct(existingproduct.id, {
      categoryId,
      description,
      image,
      brand,
      name,
    });
    await client.query("COMMIT");

    emitEvent(PRODUCT_TOPIC, {
      type: PRODUCT_EVENT.SYNC_ELASTIC_PRODUCTS_UPDATE,
      data: {
        id: existingproduct.id,
      },
    });

    return { id: existingproduct.id };
  } catch (err) {
    console.log(err);
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function searchAutocomplete(query: string) {
  if (!query) return [];

  const result = await esClient.search({
    index: PRODUCT_INDEX,
    size: 10,
    query: {
      multi_match: {
        query,
        type: "bool_prefix",
        fields: ["name^3", "description", "category.category_name"],
        fuzziness: "AUTO",
      },
    },
    _source: [
      "id",
      "name",
      "description",
      "product_image",
      "category",
      "items.id",
      "items.price",
      "items.sku",
      "items.qty_in_stock",
    ],
  });

  return result.hits.hits.map((hit: any) => {
    const source = hit._source;
    const minPrice =
      source.items?.length > 0
        ? Math.min(...source.items.map((item: any) => item.price))
        : undefined;

    return {
      id: source.id,
      name: source.name,
      slug: source.slug,
      image: source.product_image,
      category: source.category,
      price: minPrice,
      stock:
        source.items?.reduce(
          (sum: number, i: any) => sum + i.qty_in_stock,
          0
        ) ?? 0,
      sku: source.items?.[0]?.sku,
    };
  });
}

export async function listProducts({
  q,
  categoryId,
  minPrice,
  maxPrice,
  page,
  limit,
  variationOptionId,
  variationOptionValue,
}: {
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
  variationOptionId?: number;
  variationOptionValue?: string;
}): Promise<IPaginationResult<IProduct>> {
  const must: any[] = [];
  const filter: any[] = [];

  if (q) {
    must.push({
      multi_match: {
        query: q,
        fields: ["name^2", "description"],
        fuzziness: "AUTO",
      },
    });
  }

  if (categoryId) {
    filter.push({
      term: { "category.id": categoryId },
    });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.push({
      nested: {
        path: "items",
        query: {
          range: {
            "items.price": {
              gte: minPrice ?? 0,
              lte: maxPrice ?? Number.MAX_SAFE_INTEGER,
            },
          },
        },
      },
    });
  }

  if (variationOptionId || variationOptionValue) {
    filter.push({
      nested: {
        path: "items",
        query: {
          nested: {
            path: "items.configuration",
            query: {
              bool: {
                must: [
                  variationOptionId
                    ? {
                        term: { "items.configuration.id": variationOptionId },
                      }
                    : null,
                  variationOptionValue
                    ? {
                        term: {
                          "items.configuration.value": variationOptionValue,
                        },
                      }
                    : null,
                ].filter(Boolean),
              },
            },
          },
        },
      },
    });
  }

  const from = (page - 1) * limit;

  const result = await esClient.search({
    index: PRODUCT_INDEX,
    from,
    size: limit,
    query: {
      bool: {
        must,
        filter,
      },
    },
  });

  const hits = result.hits.hits.map((h) => {
    const source = h._source as any;

    const minPrice =
      source.items?.length > 0
        ? Math.min(...source.items.map((item: any) => item.price))
        : undefined;

    return {
      id: source.id,
      name: source.name,
      description: source.description,
      category: source.category,
      slug: source.slug,
      price: minPrice,
      image: source.product_image,
      items: source.items,
    };
  });

  const total = (result.hits.total as { value: number }).value;
  const totalPage = Math.ceil(total / limit);

  return {
    data: hits as any,
    pagination: {
      total,
      page,
      totalPages: totalPage,
      hasNextPage: page < totalPage,
      hasPrevPage: page > 1,
    },
  };
}

export async function deleteProduct(id: number): Promise<IDeleted> {
  const data = await productModel.deleteProduct(id);
  emitEvent(PRODUCT_TOPIC, {
    type: PRODUCT_EVENT.SYNC_ELASTIC_PRODUCTS_DELETE,
    data: {
      id,
    },
  });
  return data;
}
