import { Router } from "express";
import {
  ValidationSource,
  wrapAllRoutes,
  validator,
  requireAuth,
  roleGuard,
  IdParamDto,
  PaginateDto,
} from "shared";
import {
  createProductHandler,
  deleteProductHandler,
  getAllProductsHandler,
  getProductByIdHandler,
  searchproductsHandler,
  updateProductHandler,
} from "../controllers/product.controller";
import { SearchProductDto } from "../dtos/product/search-product.dto";
import { CreateProductDto } from "../dtos/product/create-product.dto";
import { UpdateProductDto } from "../dtos/product/update-product.dto";

const router = Router();

router.get(
  "/search",
  validator(SearchProductDto, ValidationSource.QUERY),
  searchproductsHandler
);

router.get(
  "/list",
  validator(PaginateDto, ValidationSource.QUERY),
  getAllProductsHandler
);

router.get(
  "/:id",
  validator(IdParamDto, ValidationSource.PARAM),
  getProductByIdHandler
);

router.post(
  "/create",
  requireAuth,
  roleGuard("admin"),
  validator(CreateProductDto),
  createProductHandler
);

router.patch(
  "/update/:id",
  requireAuth,
  roleGuard("admin"),
  validator(IdParamDto, ValidationSource.PARAM),
  validator(UpdateProductDto),
  updateProductHandler
);

router.delete(
  "/delete",
  requireAuth,
  roleGuard("admin"),
  validator(IdParamDto, ValidationSource.PARAM),
  deleteProductHandler
);

export default wrapAllRoutes(router);
