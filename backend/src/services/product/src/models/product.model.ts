import {
  generatePartialUpdate,
  getTenantContext,
  IPaginationRequest,
  queryDb,
} from "shared";
import { PoolClient } from "pg";
import {
  IProduct,
  IProductConfiguration,
  IProductItem,
} from "../interfaces/product.interface";

export async function createProduct(
  { categoryId, name, slug, description, brand, image = null }: IProduct,
  options?: {
    client?: PoolClient;
  }
) {
  const { tenantId } = getTenantContext();
  const query = `INSERT INTO product(category_id,name,description,brand,product_image,slug,tenant_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
  const results = await queryDb(
    query,
    [categoryId, name, description, brand, image, slug, tenantId],
    options
  );
  return results?.rows?.[0];
}

export async function createProductItem(
  {
    productId,
    price,
    qty_in_stock,
    sku,
    product_image,
  }: IProductItem & {
    productId: number;
  },
  options?: {
    client?: PoolClient;
  }
) {
  const { tenantId } = getTenantContext();
  const query =
    "INSERT INTO product_item(product_id,sku,qty_in_stock,product_image,price,tenant_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING id";
  const results = await queryDb(
    query,
    [productId, sku, qty_in_stock, product_image, price, tenantId],
    options
  );
  return results?.rows[0];
}

export async function getAllProducts({
  page = 1,
  limit = 20,
}: IPaginationRequest) {
  const { tenantId } = getTenantContext();

  const offset = (page - 1) * limit;

  const countResult = await queryDb(
    `SELECT COUNT(*) AS total FROM product WHERE tenant_id=$1`,
    [tenantId]
  );
  const total = Number(countResult?.rows?.[0]?.total || 0);

  const query = `
SELECT 
  p.id, 
  p.name,
  p.description,
  p.product_image,
  json_build_object('id', c.id, 'category_name', c.category_name) AS category,
  COUNT(pi.id) AS item_count
FROM product AS p
JOIN product_category AS c
  ON c.id = p.category_id
LEFT JOIN product_item AS pi
  ON pi.product_id = p.id
WHERE p.tenant_id = $3
GROUP BY p.id, c.id
LIMIT $1 OFFSET $2;
  `;

  const results = await queryDb(query, [limit, offset, tenantId]);
  const data = results.rows;

  const totalPages = Math.ceil(total / limit);
  return {
    pagination: {
      total,
      totalPages,
      page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    data,
  };
}

export async function getProductById(
  id: IProduct["id"],
  options?: {
    client: PoolClient;
  }
) {
  const { tenantId } = getTenantContext();
  const query = `SELECT id, category_id, name, description, brand, product_image FROM product WHERE id = $1 AND tenant_id=$2`;

  const results = await queryDb(query, [id, tenantId], options);
  return results?.rows[0];
}

export async function getProductWithCategoryById(
  id: number,
  options?: {
    client?: PoolClient;
  }
) {
  const { tenantId } = getTenantContext();
  const query = `
  SELECT 
  p.id,
  json_build_object(
        'id', c.id,
        'category_name', c.category_name
    ) AS category,
  p.name,
  p.slug,
  p.description,
  p.brand,
  p.product_image
  FROM product AS p
  INNER JOIN product_category AS c 
    ON p.category_id = c.id
  WHERE p.id = $1 AND tenant_id=$2
  `;

  const results = await queryDb(query, [id, tenantId], options);
  return results?.rows[0];
}

export async function getProductItemsByIds(
  itemIds: IProductItem["id"][],
  options?: { client?: PoolClient }
) {
  const { tenantId } = getTenantContext();
  const query = "SELECT id FROM product_item WHERE id=ANY($1) AND tenant_id=$2";
  const results = await queryDb(query, [itemIds, tenantId], options);
  return results.rows;
}

export async function checkSkuAlreadyExists(
  sku: string,
  selfId: number,
  options?: { client?: PoolClient }
) {
  const { tenantId } = getTenantContext();
  const query =
    "SELECT id FROM product_item WHERE sku = $1 AND id != $2 AND tenant_id=$3";
  const results = await queryDb(query, [sku, selfId, tenantId], options);
  return results.rows?.length > 0;
}

export async function getProductItemById(
  id: number,
  options?: {
    client?: PoolClient;
  }
) {
  const { tenantId } = getTenantContext();
  const query = `SELECT id, product_id, sku, qty_in_stock, product_image, price 
  FROM product_item 
  WHERE id = $1 AND tenant_id=$2`;

  const results = await queryDb(query, [id, tenantId], options);
  const row = results?.rows[0];
  if (!row) return null;
  return row;
}

export async function getProductItemsByProductId(
  productId: IProduct["id"],
  options?: { client?: PoolClient }
) {
  const { tenantId } = getTenantContext();
  const query = `SELECT * FROM product_item WHERE product_id = $1 AND tenant_id=$2 ORDER BY id`;
  const results = await queryDb(query, [productId, tenantId], options);
  return results?.rows;
}

export async function getProductItemBySku(
  sku: string,
  options?: { client?: PoolClient }
) {
  const { tenantId } = getTenantContext();
  const query = `SELECT * FROM product_item WHERE sku = $1 AND tenant_id=$2`;
  const results = await queryDb(query, [sku, tenantId], options);
  return results?.rows[0];
}

export async function getProductConfigurationById(
  id: number,
  options?: {
    client?: PoolClient;
  }
) {
  const { tenantId } = getTenantContext();
  const query = `SELECT * FROM product_configuration WHERE id = $1 AND tenant_id=$2`;
  const results = await queryDb(query, [id, tenantId], options);
  return results?.rows[0];
}

export async function getConfigurationsByIds(
  configIds: IProductConfiguration["id"][],
  options?: { client?: PoolClient }
) {
  const { tenantId } = getTenantContext();
  const query =
    "SELECT id FROM product_configuration WHERE tenant_id=$1 AND id=ANY($2)";
  const results = await queryDb(query, [tenantId, configIds], options);
  return results.rows;
}

export async function getConfigurationsByProductItemIds(
  productItemIds: number[],
  options?: {
    client?: PoolClient;
  }
) {
  const { tenantId } = getTenantContext();
  const query = `
  SELECT 
  pc.product_item_id,
  COALESCE(
    json_agg(
      jsonb_build_object(
        'id', vo.id,
        'value', vo.value,
        'variation_id', vo.variation_id
      )
    ) FILTER (WHERE vo.id IS NOT NULL),
    '[]'
  ) AS configurations
  FROM product_configuration AS pc 
  JOIN variation_option AS vo
    ON vo.id = pc.variation_option_id
  WHERE pc.tenant_id =$1 AND  pc.product_item_id = ANY($2)
  GROUP BY pc.product_item_id
  `;
  const results = await queryDb(query, [tenantId, productItemIds], options);
  return results?.rows;
}

export async function createProductConfiguration(
  productItemId: number,
  variationId: number,
  variationOptionId: number,
  options?: {
    client?: PoolClient;
  }
) {
  const { tenantId } = getTenantContext();
  const query =
    "INSERT INTO product_configuration(product_item_id,variation_id,variation_option_id,tenant_id) VALUES($1,$2,$3,$4)";
  await queryDb(
    query,
    [productItemId, variationId, variationOptionId, tenantId],
    options
  );
}

export async function updateProduct(
  productId: number,
  { categoryId, description, image, brand, name }: Partial<IProduct>,
  options?: { client?: PoolClient }
) {
  const { tenantId } = getTenantContext();
  const partialUpdate = generatePartialUpdate({
    category_id: categoryId,
    name,
    description,
    brand,
    product_image: image,
  });
  if (!partialUpdate) return;

  const query = [
    "UPDATE product SET",
    partialUpdate.setString,
    `WHERE id=$${partialUpdate.values.length + 1} AND tenant_id=$${
      partialUpdate.values.length + 2
    } RETURNING id`,
  ].join(" ");

  await queryDb(query, [...partialUpdate.values, productId, tenantId], options);
}

export async function updateProductItem(
  id: number,
  { sku, price, product_image, qty_in_stock }: IProductItem,
  options?: {
    client?: PoolClient;
  }
) {
  const { tenantId } = getTenantContext();
  const partialUpdate = generatePartialUpdate({
    product_image,
    qty_in_stock,
    price,
    sku,
  });
  if (!partialUpdate) return;

  const query = [
    "UPDATE product_item SET",
    partialUpdate.setString,
    `WHERE id=$${partialUpdate.values.length + 1} AND tenant_id=$${
      partialUpdate.values.length + 2
    } RETURNING id`,
  ].join(" ");

  await queryDb(query, [...partialUpdate.values, id, tenantId], options);
}

export async function updateProductConfiguration(
  id: number,
  productItemId: number,
  variationOptionId: number,
  options?: {
    client?: PoolClient;
  }
) {
  const { tenantId } = getTenantContext();
  const query =
    "UPDATE product_configuration SET variation_option_id=$1 WHERE product_item_id=$2 AND id=$3 AND tenant_id=$4";
  await queryDb(
    query,
    [variationOptionId, productItemId, id, tenantId],
    options
  );
}

export async function deleteProduct(id: number) {
  const { tenantId } = getTenantContext();
  const query = "DELETE FROM product WHERE id=$1 AND tenant_id=$2 RETURNING id";
  const results = await queryDb(query, [id, tenantId]);
  const row = results?.rows[0];
  if (!row) return null;
  return row;
}
