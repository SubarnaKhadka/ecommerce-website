import { generatePartialUpdate, IPaginationRequest, queryDb } from "shared";
import { PoolClient } from "pg";
import {
  IProduct,
  IProductConfiguration,
  IProductItem,
} from "../interfaces/product.interface";

export async function createProduct(
  { categoryId, name, slug, description, image = null }: IProduct,
  options?: {
    client?: PoolClient;
  }
) {
  const query =
    "INSERT INTO product(category_id,name,description,product_image,slug) VALUES($1,$2,$3,$4,$5) RETURNING *";
  const results = await queryDb(
    query,
    [categoryId, name, description, image, slug],
    options
  );
  const row = results?.rows?.[0];
  if (!row) return null;
  return row;
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
  const query =
    "INSERT INTO product_item(product_id,sku,qty_in_stock,product_image,price) VALUES($1,$2,$3,$4,$5) RETURNING id";
  const results = await queryDb(
    query,
    [productId, sku, qty_in_stock, product_image, price],
    options
  );
  const row = results?.rows[0];
  if (!row) return null;
  return row;
}

export async function getAllProducts({
  page = 1,
  limit = 20,
}: IPaginationRequest) {
  const offset = (page - 1) * limit;

  const countResult = await queryDb(
    `SELECT COUNT(*) AS total FROM product`,
    []
  );
  const total = Number(countResult?.rows?.[0]?.total || 0);

  const query = `
  WITH paginated_products AS (
    SELECT 
    p.id, 
    p.category_id, 
    p.name, 
    p.description, 
    p.product_image
    FROM product AS p 
    ORDER BY p.id 
    LIMIT $1 OFFSET $2
),
product_items_with_config AS (
    SELECT 
        pi.id AS product_item_id,
        pi.product_id,
        pi.sku,
        pi.price,
        pi.qty_in_stock,
        pi.product_image,
        COALESCE(json_agg(
            jsonb_build_object(
                'id', vo.id,
                'value', vo.value,
                'variation_id', vo.variation_id
            )
        ) FILTER (WHERE vo.id IS NOT NULL), '[]') AS configurations
    FROM product_item  AS pi
    LEFT JOIN product_configuration AS pc ON pc.product_item_id = pi.id
    LEFT JOIN variation_option AS vo ON vo.id = pc.variation_option_id
    GROUP BY pi.id
),
items_agg AS (
    SELECT 
     pi_config.product_id,
    json_agg(
            jsonb_build_object(
                'id', pi_config.product_item_id,
                'sku', pi_config.sku,
                'price', pi_config.price,
                'qty_in_stock', pi_config.qty_in_stock,
                'product_image', pi_config.product_image,
                'configuration', pi_config.configurations
            )
        ) AS items
     FROM product_items_with_config  AS pi_config
     GROUP BY pi_config.product_id
)

SELECT 
    pp.id,
    json_build_object(
        'id', c.id,
        'category_name', c.category_name
    ) AS category,
    pp.name,
    pp.description,
    pp.product_image,
    COALESCE(i_agg.items, '[]') AS items
FROM paginated_products AS pp 
INNER JOIN product_category c ON c.id = pp.category_id
LEFT JOIN items_agg as i_agg ON i_agg.product_id = pp.id
ORDER BY pp.id;
  `;

  const results = await queryDb(query, [limit, offset]);
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
  const query = `
  SELECT id, category_id, name, description, product_image FROM product WHERE id = $1`;

  const results = await queryDb(query, [id], options);
  const row = results?.rows[0];
  if (!row) return null;
  return row;
}

export async function getProductWithCategoryById(
  id: number,
  options?: {
    client?: PoolClient;
  }
) {
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
  p.product_image
  FROM product AS p
  INNER JOIN product_category AS c 
    ON p.category_id = c.id
  WHERE p.id = $1
  `;

  const results = await queryDb(query, [id], options);
  const row = results?.rows[0];
  if (!row) return null;
  return row;
}

export async function getProductItemsByIds(
  itemIds: IProductItem["id"][],
  options?: { client?: PoolClient }
) {
  const query = "SELECT id FROM product_item WHERE id=ANY($1)";
  const results = await queryDb(query, [itemIds], options);
  return results.rows;
}

export async function checkSkuAlreadyExists(
  sku: string,
  selfId: number,
  options?: { client?: PoolClient }
) {
  const query = "SELECT id FROM product_item WHERE sku = $1 AND id != $2";
  const results = await queryDb(query, [sku, selfId], options);
  return results.rows?.length > 0;
}

export async function getProductItemById(
  id: number,
  options?: {
    client?: PoolClient;
  }
) {
  const query = `SELECT id, product_id, sku, qty_in_stock, product_image, price FROM product_item WHERE id = $1`;

  const results = await queryDb(query, [id], options);
  const row = results?.rows[0];
  if (!row) return null;
  return row;
}

export async function getProductItemsByProductId(
  productId: IProduct["id"],
  options?: { client?: PoolClient }
) {
  const query = `SELECT * FROM product_item WHERE product_id = $1 ORDER BY id`;
  const results = await queryDb(query, [productId], options);
  return results?.rows;
}

export async function getProductItemBySku(
  sku: string,
  options?: { client?: PoolClient }
) {
  const query = `SELECT * FROM product_item WHERE sku = $1`;
  const results = await queryDb(query, [sku], options);
  return results?.rows[0];
}

export async function getProductConfigurationById(
  id: number,
  options?: {
    client?: PoolClient;
  }
) {
  const query = `SELECT * FROM product_configuration WHERE id = $1 `;
  const results = await queryDb(query, [id], options);
  const row = results?.rows[0];
  if (!row) return null;
  return row;
}

export async function getConfigurationsByIds(
  configIds: IProductConfiguration["id"][],
  options?: { client?: PoolClient }
) {
  const query = "SELECT id FROM product_configuration WHERE id=ANY($1)";
  const results = await queryDb(query, [configIds], options);
  return results.rows;
}

export async function getConfigurationsByProductItemIds(
  productItemIds: number[],
  options?: {
    client?: PoolClient;
  }
) {
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
  WHERE pc.product_item_id = ANY($1)
  GROUP BY pc.product_item_id
  `;
  const results = await queryDb(query, [productItemIds], options);
  return results?.rows;
}

export async function createProductConfiguration(
  productItemId: number,
  variationOptionId: number,
  options?: {
    client?: PoolClient;
  }
) {
  const query =
    "INSERT INTO product_configuration(product_item_id,variation_option_id) VALUES($1,$2)";
  await queryDb(query, [productItemId, variationOptionId], options);
}

export async function updateProduct(
  productId: number,
  { categoryId, description, image, name }: Partial<IProduct>,
  options?: { client?: PoolClient }
) {
  const partialUpdate = generatePartialUpdate({
    category_id: categoryId,
    name,
    description,
    product_image: image,
  });
  if (!partialUpdate) return;

  const query = [
    "UPDATE product SET",
    partialUpdate.setString,
    `WHERE id=$${partialUpdate.values.length + 1} RETURNING id`,
  ].join(" ");

  await queryDb(query, [...partialUpdate.values, productId], options);
}

export async function updateProductItem(
  id: number,
  { sku, price, product_image, qty_in_stock }: IProductItem,
  options?: {
    client?: PoolClient;
  }
) {
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
    `WHERE id=$${partialUpdate.values.length + 1} RETURNING id`,
  ].join(" ");

  await queryDb(query, [...partialUpdate.values, id], options);
}

export async function updateProductConfiguration(
  id: number,
  productItemId: number,
  variationOptionId: number,
  options?: {
    client?: PoolClient;
  }
) {
  const query =
    "UPDATE product_configuration SET variation_option_id=$1 WHERE product_item_id=$2 AND id=$3";
  await queryDb(query, [variationOptionId, productItemId, id], options);
}

export async function deleteProduct(id: number) {
  const query = "DELETE FROM product WHERE id=$1 RETURNING id";
  const results = await queryDb(query, [id]);
  const row = results?.rows[0];
  if (!row) return null;
  return row;
}
