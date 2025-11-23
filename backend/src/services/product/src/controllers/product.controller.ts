import { Request, Response } from "express";
import * as productService from "../services/product.service";
import {
  ICreated,
  IDeleted,
  IPaginationResult,
  IResponse,
  IUpdated,
} from "shared";
import { IProduct } from "../interfaces/product.interface";

export async function searchproductsHandler(
  req: Request
): Promise<IPaginationResult<IProduct>> {
  const { q, category, minPrice, maxPrice, page, limit } = req.validated?.query;
  const { data, pagination } = await productService.searchProducts({
    q,
    category,
    minPrice,
    maxPrice,
    page,
    limit,
  });
  return { data, pagination };
}

export async function getAllProductsHandler(
  req: Request
): Promise<IPaginationResult<IProduct>> {
  const { page, limit } = req?.validated?.query;
  const { data, pagination } = await productService.getAllProducts({
    page,
    limit,
  });
  return { data, pagination };
}

export async function getProductByIdHandler(
  req: Request
): Promise<IResponse<IProduct>> {
  const id = req?.validated?.params?.id;
  const data = await productService.getProductById(id);
  return { data };
}

export async function createProductHandler(
  req: Request
): Promise<IResponse<ICreated>> {
  const { name, description, image, categoryId, items } = req.validated?.body;

  const data = await productService.createProduct({
    name,
    description,
    image,
    categoryId,
    items,
  });

  return { data };
}

export async function updateProductHandler(
  req: Request
): Promise<IResponse<IUpdated>> {
  const { name, categoryId, description, image, items } = req.body;
  const id = req?.validated?.params?.id;
  const data = await productService.updateProduct({
    name,
    description,
    image,
    items,
    categoryId,
    id,
  });
  return { data };
}

export async function deleteProductHandler(
  req: Request
): Promise<IResponse<IDeleted>> {
  const id = req?.validated?.params?.id;
  const data = await productService.deleteProduct(id);
  return { data };
}
