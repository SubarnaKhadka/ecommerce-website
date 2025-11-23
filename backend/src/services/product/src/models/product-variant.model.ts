import { PoolClient } from "pg";
import {
  generatePartialUpdate,
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
  const query = "SELECT * FROM variation WHERE id=$1 LIMIT 1";
  const results = await queryDb(query, [id], options);
  const row = results?.rows?.[0];
  if (!row) return null;
  return row;
}

export async function getVariantByIdWithOption(id: number) {
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
  WHERE v.id=$1  
  GROUP BY v.id, c.category_name
  LIMIT 1
  `;
  const results = await queryDb(query, [id]);
  const row = results?.rows?.[0];
  if (!row) return null;
  return row;
}

export async function getProductVariants({
  page = 1,
  limit = 20,
  search,
}: PaginateDto): Promise<IPaginationResult<IProductVariant>> {
  const offset = (page - 1) * limit;

  const countResult = await queryDb(
    `SELECT COUNT(*) AS total FROM variation WHERE name ILIKE $1`,
    [[`%${search ?? ""}%`]]
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
  WHERE v.name ILIKE $1
  GROUP BY v.id, c.category_name
  ORDER BY v.id DESC
  LIMIT $2 OFFSET $3
  `;
  const results = await queryDb(query, [`%${search}%`, limit, offset]);
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
WHERE v.category_id = $1
GROUP BY v.id
ORDER BY v.id;
`;
  const results = await queryDb(query, [categoryId], options);
  return results?.rows;
}

export async function getAllVariationOptions(variantId: number) {
  const query = "SELECT value FROM variation_option WHERE variation_id=$1";
  const results = await queryDb(query, [variantId]);
  return results?.rows;
}

export async function getVariationOptionById(
  id: number,
  options?: {
    client?: PoolClient;
  }
) {
  const query = "SELECT * FROM variation_option WHERE id=$1 LIMIT 1";
  const results = await queryDb(query, [id], options);
  return results?.rows?.[0];
}

export async function bulkInsertProductVariationOptions(
  variationId: number,
  toInsert: string[]
) {
  const values: string[] = [];
  const params: any[] = [];
  toInsert.forEach((value, i) => {
    const idx = i * 2;
    values.push(`($${idx + 1}, $${idx + 2})`);
    params.push(variationId, value);
  });

  const query = `
      INSERT INTO variation_option (variation_id, value)
      VALUES ${values.join(", ")}
      ON CONFLICT (variation_id, value) DO NOTHING
    `;

  await queryDb(query, params);
}

export async function createProductVariant({
  name,
  categoryId,
}: IProductVariant) {
  const query =
    "INSERT INTO variation(category_id,name) VALUES($1,$2) RETURNING id";
  const results = await queryDb(query, [categoryId, name]);
  const row = results?.rows?.[0];
  if (!row) return null;
  return row;
}

export async function createProductVariantOption({
  value,
  variationId,
}: IProductVariantOption) {
  const query =
    "INSERT INTO variation_option(variation_id,value) VALUES($1,$2) ON CONFLICT (variation_id, value) DO NOTHING";
  await queryDb(query, [variationId, value]);
}

export async function updateProductVariant({ name, id }: any) {
  const partialUpdate = generatePartialUpdate({
    name: name,
  });
  if (!partialUpdate) return;

  const query = [
    "UPDATE variation SET",
    partialUpdate.setString,
    `WHERE id=$${partialUpdate.values.length + 1} RETURNING id`,
  ].join(" ");

  const results = await queryDb(query, [...partialUpdate.values, id]);
  const row = results?.rows?.[0];
  if (!row) return null;
  return row;
}

export async function deleteProductVariant(id: number) {
  const query = "DELETE FROM variation WHERE id=$1 RETURNING id";
  const results = await queryDb(query, [id]);
  return results?.rows?.[0];
}

export async function bulkDeleteProductVariationOptions(
  variationId: number,
  toDelete: string[]
) {
  const query =
    "DELETE FROM variation_option WHERE variation_id=$1 AND value=ANY($2)";
  await queryDb(query, [variationId, toDelete]);
}

export async function isVariationNameUnique(
  categoryId: number,
  name: string,
  options?: {
    excludeId?: number;
  }
) {
  let query = `SELECT id FROM variation WHERE category_id=$1 AND name=$2`;
  const params = [categoryId, name];
  if (options?.excludeId) {
    query += ` AND id != $3`;
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
  let query = `SELECT id FROM variation_option WHERE variation_id=$1 AND value=$2 LIMIT 1`;
  const params = [variationId, value];
  if (options?.excludeId) {
    query += ` AND id != $3`;
    params.push(options?.excludeId);
  }

  const results = await queryDb(query, params);
  return results?.rowCount === 0;
}
