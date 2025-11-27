import { Router } from "express";
import {
  wrapAllRoutes,
  validator,
  IdParamDto,
  ValidationSource,
  PartialType,
  requireAuth,
  roleGuard,
  PaginateDto,
} from "shared";
import {
  createTanentHandler,
  deleteTanentHandler,
  listTanentHandler,
  updateTanentHandler,
} from "../controllers/tenant.controller";
import { TanentDto } from "../dtos/tenant.dto";

const router = Router();

router.get(
  "/list",
  requireAuth,
  roleGuard("super-admin"),
  validator(PaginateDto, ValidationSource.QUERY),
  listTanentHandler
);

router.post(
  "/create",
  requireAuth,
  roleGuard("super-admin"),
  validator(TanentDto),
  createTanentHandler
);
router.patch(
  "/update/:id",
  requireAuth,
  roleGuard("super-admin"),
  validator(PartialType(TanentDto)),
  validator(IdParamDto, ValidationSource.PARAM),
  updateTanentHandler
);
router.delete(
  "/delete/:id",
  requireAuth,
  roleGuard("super-admin"),
  validator(IdParamDto, ValidationSource.PARAM),
  deleteTanentHandler
);

export default wrapAllRoutes(router);
