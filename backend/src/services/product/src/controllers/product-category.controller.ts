import { Request } from "express";
import * as productCategoryService from "../services/product-category.service";
import {
  ICreated,
  IDeleted,
  IPaginationResult,
  IResponse,
  IUpdated,
} from "shared";
import { IProductCategory } from "../interfaces/product-category.interface";

export async function getAllProductCategoryHandler(
  req: Request
): Promise<IPaginationResult<IProductCategory>> {
  const { page, limit, search } = req.validated?.query;

  const { data, pagination } =
    await productCategoryService.getAllProductCategory({
      page,
      limit,
      search,
    });

  return { data, pagination };
}

export async function createProductCategoryHandler(
  req: Request
): Promise<IResponse<ICreated>> {
  const { parentCategoryId, name } = req.validated?.body;

  const data = await productCategoryService.createProductCategory({
    parentCategoryId,
    name,
  });

  return { statusCode: 201, data };
}

export async function updateProductCategoryHandler(
  req: Request
): Promise<IResponse<IUpdated>> {
  const { id } = req.validated?.params;
  const { parentCategoryId, name } = req.validated?.body;

  const data = await productCategoryService.updateProductCategory({
    parentCategoryId,
    name,
    id,
  });
  return { data };
}

export async function deleteProductCategoryHandler(
  req: Request
): Promise<IResponse<IDeleted>> {
  const { id } = req.validated?.params;
  const data = await productCategoryService.deleteProductCategory(id);
  return { data };
}
