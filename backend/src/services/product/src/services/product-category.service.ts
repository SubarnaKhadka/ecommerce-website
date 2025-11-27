import {
  BadRequestException,
  ConflictException,
  ICreated,
  IDeleted,
  IPaginationRequest,
  IPaginationResult,
  IUpdated,
  NotFoundException,
} from "shared";
import * as productCategoryModel from "../models/product-category.model";
import * as productHelper from "../helpers/product.helper";
import { IProductCategory } from "../interfaces/product-category.interface";

export async function getAllProductCategory({
  page,
  limit,
  search,
}: IPaginationRequest): Promise<IPaginationResult<IProductCategory>> {
  return await productCategoryModel.getAllProductCategory({
    page,
    limit,
    search,
  });
}

export async function createProductCategory({
  parentCategoryId,
  name,
}: IProductCategory): Promise<ICreated> {
  const existingCategoryWithName = await productCategoryModel.getCategoryByName(
    name
  );

  if (existingCategoryWithName) {
    throw new ConflictException("Category name already exists");
  }

  const { slug } = productHelper.generateSlug(name);

  return await productCategoryModel.createProductCategory({
    parentCategoryId,
    name,
    slug,
  });
}

export async function updateProductCategory({
  parentCategoryId,
  name,
  id,
}: Partial<IProductCategory>): Promise<IUpdated> {
  const existingCategory = await productCategoryModel.getCategoryById(id);
  if (!existingCategory) {
    throw new NotFoundException("Category not found");
  }

  if (name) {
    const existingCategoryWithName =
      await productCategoryModel.getCategoryByName(name, {
        excludeId: existingCategory.id,
      });

    if (existingCategoryWithName) {
      throw new ConflictException(
        "Cannot update, category name already exists"
      );
    }
  }

  if (parentCategoryId) {
    const existingParentCategory = await productCategoryModel.getCategoryById(
      parentCategoryId
    );
    if (!existingParentCategory) {
      throw new BadRequestException("Parent category not found");
    }
  }

  return await productCategoryModel.updateProductCategory({
    parentCategoryId,
    name,
    id,
  });
}

export async function deleteProductCategory(id: number): Promise<IDeleted> {
  const existingCategory = await productCategoryModel.getCategoryById(id);
  if (!existingCategory) {
    throw new NotFoundException("Category not found");
  }
  return await productCategoryModel.deleteProductCategory(id);
}
