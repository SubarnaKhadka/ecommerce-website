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
  autoCompleteSearchProductsHandler,
  createProductHandler,
  deleteProductHandler,
  getAllProductsHandler,
  getProductByIdHandler,
  listProductsHandler,
  updateProductHandler,
} from "../controllers/product.controller";
import {
  AutoCompleteSearchDto,
  SearchProductDto,
} from "../dtos/product/search-product.dto";
import { CreateProductDto } from "../dtos/product/create-product.dto";
import { UpdateProductDto } from "../dtos/product/update-product.dto";

const router = Router();

router.get(
  "/search",
  validator(AutoCompleteSearchDto, ValidationSource.QUERY),
  autoCompleteSearchProductsHandler
);

router.get(
  "/all",
  validator(SearchProductDto, ValidationSource.QUERY),
  listProductsHandler
);

router.get(
  "/list",
  requireAuth,
  roleGuard("admin"),
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
