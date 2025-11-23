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
  createProductCategoryHandler,
  deleteProductCategoryHandler,
  getAllProductCategoryHandler,
  updateProductCategoryHandler,
} from "../controllers/product-category.controller";
import { CreateProductCategoryDto } from "../dtos/product-category/create-product-category.dto";
import { UpdateProductCategoryDto } from "../dtos/product-category/update-product-category";

const router = Router();

router.get(
  "/list",
  validator(PaginateDto, ValidationSource.QUERY),
  getAllProductCategoryHandler
);

router.post(
  "/create",
  requireAuth,
  roleGuard("admin"),
  validator(CreateProductCategoryDto),
  createProductCategoryHandler
);
router.patch(
  "/update/:id",
  requireAuth,
  roleGuard("admin"),
  validator(IdParamDto, ValidationSource.PARAM),
  validator(UpdateProductCategoryDto),
  updateProductCategoryHandler
);
router.delete(
  "/delete/:id",
  requireAuth,
  roleGuard("admin"),
  validator(IdParamDto, ValidationSource.PARAM),
  deleteProductCategoryHandler
);

export default wrapAllRoutes(router);
