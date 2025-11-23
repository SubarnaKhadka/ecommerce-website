import type { PoolClient } from "pg";
import {
  generatePartialUpdate,
  IPaginationRequest,
  IPaginationResult,
  PgPaginator,
  queryDb,
} from "shared";
import { IProductCategory } from "../interfaces/product-category.interface";

export async function getAllProductCategory({
  limit,
  page,
  search,
}: IPaginationRequest): Promise<IPaginationResult<IProductCategory>> {
  const paginator = PgPaginator.getInstance();
  return await paginator.paginate("product_category", {
    page,
    limit,
    search: {
      category_name: search,
    },
  });
}

export async function getCategoryById(
  id: IProductCategory["id"],
  options?: {
    client?: PoolClient;
  }
) {
  const query = "SELECT * FROM product_category WHERE id=$1";
  const results = await queryDb(query, [id], options);
  const row = results?.rows?.[0];
  if (!row) return null;
  return row;
}

export async function getCategoryByName(
  name: string,
  options?: {
    excludeId?: number;
  }
) {
  const params = [name];
  let query = "SELECT * FROM product_category WHERE category_name=$1";
  if (options?.excludeId) {
    query += " AND id!=$2";
    params.push(String(options?.excludeId));
  }
  const results = await queryDb(query, params);
  const row = results?.rows?.[0];
  if (!row) return null;
  return row;
}

export async function createProductCategory({
  parentCategoryId,
  name,
}: IProductCategory) {
  const query =
    "INSERT INTO product_category(parent_category_id,category_name) VALUES($1,$2) RETURNING id";
  const results = await queryDb(query, [parentCategoryId, name]);
  const row = results?.rows?.[0];
  if (!row) return null;
  return row;
}

export async function updateProductCategory({
  parentCategoryId,
  name,
  id,
}: Partial<IProductCategory>) {
  const partialUpdate = generatePartialUpdate({
    parent_category_id: parentCategoryId,
    category_name: name,
  });
  if (!partialUpdate) return;

  const query = [
    "UPDATE product_category SET",
    partialUpdate.setString,
    `WHERE id=$${partialUpdate.values.length + 1} RETURNING id`,
  ].join(" ");

  const results = await queryDb(query, [...partialUpdate.values, id]);
  const row = results?.rows?.[0];
  if (!row) return null;
  return row;
}

export async function deleteProductCategory(id: number) {
  const query = "DELETE FROM product_category WHERE id=$1 RETURNING id";
  const results = await queryDb(query, [id]);
  const row = results?.rows?.[0];
  if (!row) return null;
  return row;
}
