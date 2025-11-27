import {
  ICreated,
  IDeleted,
  IPaginationRequest,
  IPaginationResult,
  ITenant,
  IUpdated,
  PgPaginator,
  redisClient,
} from "shared";
import * as tenantModel from "../models/tenant.model";

export async function listAllTenant({
  limit,
  page,
  search,
}: IPaginationRequest): Promise<IPaginationResult<ITenant>> {
  const pgPaginator = PgPaginator.getInstance();
  return await pgPaginator.paginate("tenants", {
    page,
    limit,
    search: {
      name: search,
      domain: search,
    },
  });
}

export async function createTenant({
  name,
  domain,
  dedicated_db,
  db_name,
}: ITenant): Promise<ICreated> {
  const data = await tenantModel.createTenant({
    name,
    domain,
    dedicated_db,
    db_name,
  });
  await redisClient.del("tenants");
  return data;
}

export async function updateTenant({
  id,
  name,
  domain,
  dedicated_db,
  db_name,
}: Partial<ITenant>): Promise<IUpdated> {
  const data = await tenantModel.updateTenant({
    id,
    name,
    domain,
    dedicated_db,
    db_name,
  });
  await redisClient.del("tenants");
  return data;
}

export async function deleteTenant(id: number): Promise<IDeleted> {
  const data = await tenantModel.deleteTenant(id);
  await redisClient.del("tenants");
  return data;
}
