import { Router } from "express";
import {
  ValidationSource,
  wrapAllRoutes,
  validator,
  IdParamDto,
  requireAuth,
  roleGuard,
  PaginateDto,
} from "shared";

import {
  createProductVariantHandler,
  deleteProductVariantsHandler,
  getProductVariantByIdHandler,
  getAllProductVariantsHandler,
  updateProductVariantsHandler,
} from "../controllers/product-variation.controller";
import { CreateProductVariantDto } from "../dtos/product-variant/create-product-variant.dto";
import { UpdateProductVariantDto } from "../dtos/product-variant/update-product-variant.dto";

const router = Router();

router.get(
  "/list",
  validator(PaginateDto, ValidationSource.QUERY),
  getAllProductVariantsHandler
);

router.get(
  "/:id",
  validator(IdParamDto, ValidationSource.PARAM),
  getProductVariantByIdHandler
);

router.post(
  "/create",
  requireAuth,
  roleGuard("admin"),
  validator(CreateProductVariantDto),
  createProductVariantHandler
);
router.patch(
  "/update/:id",
  requireAuth,
  roleGuard("admin"),
  validator(IdParamDto, ValidationSource.PARAM),
  validator(UpdateProductVariantDto),
  updateProductVariantsHandler
);
router.delete(
  "/delete/:id",
  requireAuth,
  roleGuard("admin"),
  validator(IdParamDto, ValidationSource.PARAM),
  deleteProductVariantsHandler
);

export default wrapAllRoutes(router);
