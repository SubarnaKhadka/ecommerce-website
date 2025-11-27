import { Request, Response } from "express";
import { WithId, Document } from "mongodb";

import {
  HttpStatus,
  UnauthorizedException,
  extractUserAgent,
  IPaginationResult,
} from "shared";
import * as userService from "../services/user.service";
import { ACCESS_EXPIRES_IN_SECONDS } from "../constants/user.constant";

export const registerHandler = async (req: Request) => {
  const { email, password, phone } = req?.validated?.body;
  const user = await userService.registerUser(email, password, phone);

  return {
    statusCode: HttpStatus.CREATED,
    data: {
      id: user.id,
    },
  };
};

export const loginHandler = async (req: Request, res: Response) => {
  const { email, password } = req.validated?.body;

  const { ip, userAgent } = extractUserAgent(req);
  const { accessToken, refreshToken } = await userService.loginUser(
    email,
    password,
    ip,
    userAgent
  );

  return {
    data: {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_EXPIRES_IN_SECONDS,
    },
  };
};

export const refreshHandler = async (req: Request, res: Response) => {
  const token = req.headers["x-refresh-token"] as string;
  if (!token) {
    throw new UnauthorizedException("Refresh token missing");
  }

  const { ip, userAgent } = extractUserAgent(req);
  const { accessToken, refreshToken } = await userService.rotateRefreshToken(
    token,
    ip,
    userAgent
  );

  return {
    data: {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_EXPIRES_IN_SECONDS,
    },
  };
};

export const profileHandler = async (req: Request) => {
  const id = req.user?.id!;
  const user = await userService.getProfile(id);
  return { data: user };
};

export async function logoutHandler(req: Request, res: Response) {
  const token = req.headers["x-refresh-token"] as string;
  await userService.logoutUser(token);
}

export async function failedLoginHandler(
  req: Request
): Promise<IPaginationResult<WithId<Document>>> {
  const { page, limit } = req.validated?.query;
  const { data, pagination } = await userService.getFailedLogins({
    page,
    limit,
  });
  return { data, pagination };
}
