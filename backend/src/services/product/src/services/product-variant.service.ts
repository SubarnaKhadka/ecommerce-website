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

import * as productVariantModel from "../models/product-variant.model";
import * as productCategoryModel from "../models/product-category.model";
import { IProductVariant } from "../interfaces/product-variation.interface";

export async function getProductVariants({
  page,
  limit,
  search,
}: IPaginationRequest): Promise<IPaginationResult<IProductVariant>> {
  return await productVariantModel.getProductVariants({
    page,
    limit,
    search,
  });
}

export async function getProductVariantByIdWithOption(id: number) {
  const variant = await productVariantModel.getVariantByIdWithOption(id);
  if (!variant) {
    throw new NotFoundException("Product variant not found");
  }
  return variant;
}

export async function createProductVariant({
  name,
  categoryId,
  options,
}: IProductVariant): Promise<ICreated> {
  const existingCategory = await productCategoryModel.getCategoryById(
    categoryId
  );
  if (!existingCategory) {
    throw new BadRequestException("Category not found");
  }

  const isUnique = await productVariantModel.isVariationNameUnique(
    categoryId,
    name
  );
  if (!isUnique) {
    throw new ConflictException(
      "Variation name already exists in this category"
    );
  }

  const createdVariant = await productVariantModel.createProductVariant({
    name,
    categoryId,
  });

  const uniqueOptions = Array.from(new Set(options));

  const promises = uniqueOptions.map((option) =>
    productVariantModel.createProductVariantOption({
      value: option,
      variationId: createdVariant.id,
    })
  );
  await Promise.all(promises);

  return { id: createdVariant.id };
}

export async function updateProductVariant({
  id,
  name,
  options,
}: Partial<IProductVariant>): Promise<IUpdated> {
  const existingVariant = await productVariantModel.getVariantById(id);
  if (!existingVariant) {
    throw new NotFoundException("Product variant not found");
  }

  if (name) {
    const isUnique = await productVariantModel.isVariationNameUnique(
      existingVariant.categoryId,
      name,
      { excludeId: existingVariant.id }
    );
    if (!isUnique) {
      throw new ConflictException(
        "Variation name already exists in this category"
      );
    }
  }

  await productVariantModel.updateProductVariant({
    id: existingVariant.id,
    name,
  });

  if (options) {
    await updateProductVariationOptions(existingVariant.id, options);
  }

  return { id: existingVariant.id };
}

export async function updateProductVariationOptions(
  variationId: number,
  newOptions: string[]
): Promise<void> {
  const uniqueOptions = Array.from(new Set(newOptions));
  const existingRows = await productVariantModel.getAllVariationOptions(
    variationId
  );
  const existingVariationOptions = existingRows?.map((row) => row.value);

  const toInsert = uniqueOptions.filter(
    (v) => !existingVariationOptions.includes(v)
  );
  const toDelete = existingVariationOptions.filter(
    (v) => !uniqueOptions.includes(v)
  );

  if (toDelete.length > 0) {
    await productVariantModel.bulkDeleteProductVariationOptions(
      variationId,
      toDelete
    );
  }

  if (toInsert.length > 0) {
    await productVariantModel.bulkInsertProductVariationOptions(
      variationId,
      toInsert
    );
  }
}

export async function deleteProductVariant(id: number): Promise<IDeleted> {
  const existingProductVariant = await productVariantModel.getVariantById(id);
  if (!existingProductVariant) {
    throw new NotFoundException("Product variant not found");
  }
  return await productVariantModel.deleteProductVariant(id);
}
