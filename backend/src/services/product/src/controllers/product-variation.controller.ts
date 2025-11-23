import { Request } from "express";
import * as productVariantService from "../services/product-variant.service";
import {
  ICreated,
  IDeleted,
  IPaginationResult,
  IResponse,
  IUpdated,
} from "shared";
import { IProductVariant } from "../interfaces/product-variation.interface";

export async function getAllProductVariantsHandler(
  req: Request
): Promise<IPaginationResult<IProductVariant>> {
  const { page, limit, search } = req.validated?.query;

  const { data, pagination } = await productVariantService.getProductVariants({
    page,
    limit,
    search: search,
  });
  return { data, pagination };
}

export async function getProductVariantByIdHandler(
  req: Request
): Promise<IResponse<IProductVariant>> {
  const { id } = req.validated?.params;
  const data = await productVariantService.getProductVariantByIdWithOption(id);
  return { data };
}

export async function createProductVariantHandler(
  req: Request
): Promise<IResponse<ICreated>> {
  const { name, categoryId, options } = req.validated?.body;
  const data = await productVariantService.createProductVariant({
    name,
    categoryId,
    options,
  });
  return { data };
}

export async function updateProductVariantsHandler(
  req: Request
): Promise<IResponse<IUpdated>> {
  const { name, options } = req.validated?.body;
  const { id } = req.validated?.params;
  const data = await productVariantService.updateProductVariant({
    id,
    name,
    options,
  });
  return { data };
}

export async function deleteProductVariantsHandler(
  req: Request
): Promise<IResponse<IDeleted>> {
  const { id } = req.validated?.params;
  const data = await productVariantService.deleteProductVariant(id);
  return { data };
}
