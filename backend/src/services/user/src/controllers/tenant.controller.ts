import { Request } from "express";
import * as tenantService from "../services/tenant.service";
import {
  ICreated,
  IDeleted,
  IPaginationResult,
  IResponse,
  ITenant,
  IUpdated,
} from "shared";

export async function listTanentHandler(
  req: Request
): Promise<IPaginationResult<ITenant>> {
  const { page, limit, search } = req.validated?.query;
  const { data, pagination } = await tenantService.listAllTenant({
    page,
    limit,
    search,
  });
  return { data, pagination };
}

export async function createTanentHandler(
  req: Request
): Promise<IResponse<ICreated>> {
  const { name, domain, dedicated_db, db_name } = req?.validated?.body;
  const data = await tenantService.createTenant({
    name,
    domain,
    dedicated_db,
    db_name,
  });
  return { data };
}

export async function updateTanentHandler(
  req: Request
): Promise<IResponse<IUpdated>> {
  const { name, domain, dedicated_db, db_name } = req?.validated?.body;
  const id = req?.validated?.params?.id;
  const data = await tenantService.updateTenant({
    id,
    name,
    domain,
    dedicated_db,
    db_name,
  });
  return { data };
}

export async function deleteTanentHandler(
  req: Request
): Promise<IResponse<IDeleted>> {
  const id = req?.validated?.params?.id;
  const data = await tenantService.deleteTenant(id);
  return { data };
}
