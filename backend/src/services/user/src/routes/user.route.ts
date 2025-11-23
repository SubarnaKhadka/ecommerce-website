import { Router } from "express";
import {
  validator,
  wrapAllRoutes,
  requireAuth,
  roleGuard,
  ValidationSource,
  PaginateDto,
} from "shared";

import {
  failedLoginHandler,
  loginHandler,
  profileHandler,
  refreshHandler,
  registerHandler,
} from "../controllers/user.controller";
import { LoginUserDto } from "../dtos/login.dto";
import { CreateUserDto } from "../dtos/register.dto";

const router = Router();

router.post("/register", validator(CreateUserDto), registerHandler);
router.post("/login", validator(LoginUserDto), loginHandler);
router.post("/refresh", requireAuth, refreshHandler);
router.get("/me", requireAuth, profileHandler);
router.get(
  "/failed_logins",
  requireAuth,
  roleGuard("admin"),
  validator(PaginateDto, ValidationSource.PARAM),
  failedLoginHandler
);

export default wrapAllRoutes(router);
