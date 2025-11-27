import { PoolClient } from "pg";
import {
  generatePartialUpdate,
  getTenantContext,
  IPaginationResult,
  PaginateDto,
  queryDb,
} from "shared";

import {
  IProductVariant,
  IProductVariantOption,
} from "../interfaces/product-variation.interface";

export async function getVariantById(
  id: IProductVariant["id"],
  options?: { client?: PoolClient }
) {
  const { tenantId } = getTenantContext();
  const query = "SELECT * FROM variation WHERE id=$1 AND tenant_id=$2 LIMIT 1";
  const results = await queryDb(query, [id, tenantId], options);
  return results?.rows?.[0];
}

export async function getVariantByIdWithOption(id: number) {
  const { tenantId } = getTenantContext();
  const query = `
  SELECT
  v.id,
  v.name,
  v.category_id,
  c.category_name,
  COALESCE(
    json_agg(
      json_build_object('id', o.id, 'value', o.value)
    ) FILTER (WHERE o.id IS NOT NULL),
    '[]'
  ) AS options
  FROM variation AS v
  LEFT JOIN product_category AS c
    ON v.category_id = c.id
  LEFT JOIN variation_option AS o
    ON v.id = o.variation_id
  WHERE v.id=$1 AND tenant_id=$2
  GROUP BY v.id, c.category_name
  LIMIT 1
  `;
  const results = await queryDb(query, [id, tenantId]);
  return results?.rows?.[0];
}

export async function getProductVariants({
  page = 1,
  limit = 20,
  search,
}: PaginateDto): Promise<IPaginationResult<IProductVariant>> {
  const { tenantId } = getTenantContext();
  const offset = (page - 1) * limit;

  const countResult = await queryDb(
    `SELECT COUNT(*) AS total FROM variation WHERE name ILIKE $1 AND tenant_id=$2`,
    [[`%${search ?? ""}%`, tenantId]]
  );
  const total = Number(countResult?.rows?.[0]?.total || 0);

  const query = `
  SELECT 
  v.id, 
  v.name, 
  v.category_id, 
  c.category_name,
  COALESCE(
        json_agg(
          json_build_object('id', o.id, 'value', o.value)
        ) FILTER (WHERE o.id IS NOT NULL),
        '[]'
      ) AS options
  FROM variation AS v 
  LEFT JOIN product_category AS c
    ON v.category_id = c.id
  LEFT JOIN variation_option AS o 
    ON v.id = o.variation_id
  WHERE v.name ILIKE $1 AND tenant_id=$4
  GROUP BY v.id, c.category_name
  ORDER BY v.id DESC
  LIMIT $2 OFFSET $3
  `;
  const results = await queryDb(query, [
    `%${search}%`,
    limit,
    offset,
    tenantId,
  ]);
  const data = results?.rows;

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

export async function getVariationsByCategoryId(
  categoryId: number,
  options?: {
    client: PoolClient;
  }
) {
  const { tenantId } = getTenantContext();
  const query = `
SELECT 
  v.id,
  v.name,
  COALESCE(
    json_agg(jsonb_build_object('id', vo.id, 'value', vo.value)) 
      FILTER (WHERE vo.id IS NOT NULL),
    '[]'
  ) AS options
FROM variation AS v
LEFT JOIN variation_option AS vo
  ON vo.variation_id = v.id
WHERE v.category_id = $1 AND tenant_id=$2
GROUP BY v.id
ORDER BY v.id;
`;
  const results = await queryDb(query, [categoryId, tenantId], options);
  return results?.rows;
}

export async function getAllVariationOptions(variantId: number) {
  const { tenantId } = getTenantContext();
  const query =
    "SELECT value FROM variation_option WHERE variation_id=$1 AND tenant_id=$2";
  const results = await queryDb(query, [variantId, tenantId]);
  return results?.rows;
}

export async function getVariationOptionById(
  id: number,
  options?: {
    client?: PoolClient;
  }
) {
  const { tenantId } = getTenantContext();
  const query =
    "SELECT * FROM variation_option WHERE id=$1 AND tenant_id=$2 LIMIT 1";
  const results = await queryDb(query, [id, tenantId], options);
  return results?.rows?.[0];
}

export async function bulkInsertProductVariationOptions(
  variationId: number,
  toInsert: string[]
) {
  const { tenantId } = getTenantContext();
  const values: string[] = [];
  const params: any[] = [];
  toInsert.forEach((value, i) => {
    const idx = i * 3;
    values.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}))`);
    params.push(variationId, value, tenantId);
  });

  const query = `
      INSERT INTO variation_option (variation_id, value, tenant_id)
      VALUES ${values.join(", ")}
      ON CONFLICT (variation_id, value) DO NOTHING
    `;

  await queryDb(query, params);
}

export async function createProductVariant({
  name,
  categoryId,
}: IProductVariant) {
  const { tenantId } = getTenantContext();
  const query =
    "INSERT INTO variation(category_id,name, tenant_id) VALUES($1,$2,$3) RETURNING id";
  const results = await queryDb(query, [categoryId, name, tenantId]);
  return results?.rows?.[0];
}

export async function createProductVariantOption({
  value,
  variationId,
}: IProductVariantOption) {
  const { tenantId } = getTenantContext();
  const query =
    "INSERT INTO variation_option(variation_id,value, tenant_id) VALUES($1,$2,$3) ON CONFLICT (variation_id, value) DO NOTHING";
  await queryDb(query, [variationId, value, tenantId]);
}

export async function updateProductVariant({ name, id }: any) {
  const { tenantId } = getTenantContext();
  const partialUpdate = generatePartialUpdate({
    name: name,
  });
  if (!partialUpdate) return;

  const query = [
    "UPDATE variation SET",
    partialUpdate.setString,
    `WHERE id=$${partialUpdate.values.length + 1} AND tenant_id=$${
      partialUpdate.values.length + 2
    } RETURNING id`,
  ].join(" ");

  const results = await queryDb(query, [...partialUpdate.values, id, tenantId]);
  return results?.rows?.[0];
}

export async function deleteProductVariant(id: number) {
  const { tenantId } = getTenantContext();
  const query =
    "DELETE FROM variation WHERE id=$1 AND tenant_id=$2 RETURNING id";
  const results = await queryDb(query, [id, tenantId]);
  return results?.rows?.[0];
}

export async function bulkDeleteProductVariationOptions(
  variationId: number,
  toDelete: string[]
) {
  const { tenantId } = getTenantContext();
  const query =
    "DELETE FROM variation_option WHERE variation_id=$1 AND tenant_id=$2 AND value=ANY($3)";
  await queryDb(query, [variationId, tenantId, toDelete]);
}

export async function isVariationNameUnique(
  categoryId: number,
  name: string,
  options?: {
    excludeId?: number;
  }
) {
  const { tenantId } = getTenantContext();
  let query = `SELECT id FROM variation WHERE category_id=$1 AND name=$2 AND tenant_id=$3`;
  const params = [categoryId, name, tenantId];
  if (options?.excludeId) {
    query += ` AND id != $4`;
    params.push(options?.excludeId);
  }

  const results = await queryDb(query, params);
  return results?.rowCount === 0;
}

export async function isVariationOptionUnique(
  variationId: number,
  value: string,
  options?: { excludeId: number }
) {
  const { tenantId } = getTenantContext();
  let query = `SELECT id FROM variation_option WHERE variation_id=$1 AND value=$2 AND tenant_id=$3 LIMIT 1`;
  const params = [variationId, value, tenantId];
  if (options?.excludeId) {
    query += ` AND id != $4`;
    params.push(options?.excludeId);
  }

  const results = await queryDb(query, params);
  return results?.rowCount === 0;
}
