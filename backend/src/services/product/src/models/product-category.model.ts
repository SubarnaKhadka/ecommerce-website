import type { PoolClient } from "pg";
import {
  generatePartialUpdate,
  getTenantContext,
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
  const { tenantId } = getTenantContext();
  const query = "SELECT * FROM product_category WHERE id=$1 and tenant_id = $2";
  const results = await queryDb(query, [id, tenantId], options);
  return results?.rows?.[0];
}

export async function getCategoryByName(
  name: string,
  options?: {
    excludeId?: number;
  }
) {
  const { tenantId } = getTenantContext();
  const params = [name, tenantId];
  let query =
    "SELECT * FROM product_category WHERE category_name=$1 AND tenant_id = $2";
  if (options?.excludeId) {
    query += " AND id!=$3";
    params.push(String(options?.excludeId));
  }
  const results = await queryDb(query, params);
  return results?.rows?.[0];
}

export async function createProductCategory({
  parentCategoryId,
  name,
  slug,
}: IProductCategory) {
  const { tenantId } = getTenantContext();
  const query =
    "INSERT INTO product_category(parent_category_id,category_name,slug,tenant_id) VALUES($1,$2,$3,$4) RETURNING id";
  const results = await queryDb(query, [
    parentCategoryId,
    name,
    slug,
    tenantId,
  ]);
  return results?.rows?.[0];
}

export async function updateProductCategory({
  parentCategoryId,
  name,
  id,
}: Partial<IProductCategory>) {
  const { tenantId } = getTenantContext();

  const partialUpdate = generatePartialUpdate({
    parent_category_id: parentCategoryId,
    category_name: name,
  });
  if (!partialUpdate) return;

  const query = [
    "UPDATE product_category SET",
    partialUpdate.setString,
    `WHERE id=$${partialUpdate.values.length + 1} AND tenant_id=$${
      partialUpdate.values.length + 2
    } RETURNING id`,
  ].join(" ");

  const results = await queryDb(query, [...partialUpdate.values, id, tenantId]);
  return results?.rows?.[0];
}

export async function deleteProductCategory(id: number) {
  const { tenantId } = getTenantContext();
  const query =
    "DELETE FROM product_category WHERE id=$1 AND tenant_id=$2 RETURNING id";
  const results = await queryDb(query, [id, tenantId]);
  return results?.rows?.[0];
}
