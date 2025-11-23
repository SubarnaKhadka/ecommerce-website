import {
  comparePassword,
  config,
  ConflictException,
  emitEvent,
  generateRandomToken,
  hashPassword,
  HttpException,
  InternalServerErrorException,
  signAccessToken,
  UnauthorizedException,
} from "shared";

import * as userModel from "../models/user.modal";
import * as tokenModel from "../models/token.model";
import {
  blockKey,
  failedKey,
  incrementFailedCount,
  isBlockedKey,
  resetFailedCount,
} from "./rate.service";
import {
  APP_NAME,
  EMAIL_TOPIC,
  REFRESH_TOKEN_EXP_IN_MILLISECONDS,
  USER_TOPIC,
} from "../constants/user.constant";
import { UserEvent } from "../enums/user-event.enum";
import { IUser } from "../interfaces/user.interface";

type IValidateUser = {
  user: IUser | null;
  ip: string;
  credentials: {
    email: string;
    password: string;
  };
};

async function validateLoginUser({ user, ip, credentials }: IValidateUser) {
  const ipKey = failedKey("ip", ip);

  if (!user) {
    const isIpBlocked = await isBlockedKey(ipKey);
    if (isIpBlocked) {
      throw new HttpException(
        429,
        "Too many requests from your IP. Try later."
      );
    }

    const count = await incrementFailedCount(ipKey);
    const failedLogin = await tokenModel.recordFailedLogin(null, ip);
    emitEvent(USER_TOPIC, {
      type: UserEvent.USER_FAILED_LOGIN,
      data: {
        ip,
        failedId: failedLogin?.id,
        emailUsedForLogin: credentials.email,
        passwordUsedForLogin: credentials.password,
        meta: {
          reason: "Email not found",
        },
        user: null,
      },
    });
    if (count >= config.auth.maxFailedAttempt) {
      await blockKey(ipKey, config.auth.blockMinutes);
    }

    throw new HttpException(404, "Invalid credentials");
  }

  const userFailedKey = failedKey("user", String(user?.id));
  if (await isBlockedKey(userFailedKey)) {
    throw new HttpException(
      429,
      "Too many failed attempts for this account. Try later."
    );
  }

  const isValidPassword = await comparePassword(
    credentials.password,
    user?.password
  );
  if (!isValidPassword) {
    const count = await incrementFailedCount(userFailedKey!);
    const failedLogin = await tokenModel.recordFailedLogin(user?.id, ip);
    emitEvent(USER_TOPIC, {
      type: UserEvent.USER_FAILED_LOGIN,
      data: {
        ip,
        failedId: failedLogin?.id,
        emailUsedForLogin: credentials.email,
        passwordUsedForLogin: credentials.password,
        meta: {
          reason: "Invalid password",
        },
        user: {
          ...user,
        },
      },
    });
    if (count >= config.auth.maxFailedAttempt) {
      await blockKey(userFailedKey, config.auth.blockMinutes);
    }

    throw new UnauthorizedException("Invalid credentials");
  }

  await resetFailedCount(userFailedKey);
  await resetFailedCount(ipKey);
}

export async function registerUser(
  email: string,
  password: string,
  phone: string
) {
  const isEmailAlreadyExist = await userModel.getUserByEmail(email);
  if (isEmailAlreadyExist) {
    throw new ConflictException("Email already exists");
  }

  const passwordHash = await hashPassword(password);
  const createdUser = await userModel.createUser({
    email,
    passwordHash,
    phone,
  });
  if (!createdUser) {
    throw new InternalServerErrorException();
  }

  emitEvent(EMAIL_TOPIC, {
    to: createdUser.email_address,
    subject: `Welcome to ${APP_NAME}`,
    message: "Hello, Your account is successfully created",
  });

  return createdUser;
}

export async function loginUser(
  email: string,
  password: string,
  ip: string,
  userAgent?: string
) {
  const existingUser = await userModel.getUserByEmail(email);
  await validateLoginUser({
    user: existingUser,
    ip,
    credentials: {
      email,
      password,
    },
  });

  const { token: accessToken } = signAccessToken({
    id: existingUser!.id,
    role: existingUser!.role,
  });

  const refreshToken = generateRandomToken(64);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXP_IN_MILLISECONDS);

  await tokenModel.saveRefreshToken({
    id: existingUser!.id,
    token: refreshToken,
    expiresAt: expiresAt,
    meta: {
      userAgent,
      ip,
    },
  });

  return { accessToken, refreshToken };
}

export async function rotateRefreshToken(
  token: string,
  ip: string,
  userAgent?: string
) {
  const stored = await tokenModel.findRefreshTokenByHash(token);
  if (!stored) throw new Error("Invalid refresh token");
  if (stored.revoked) {
    await tokenModel.revokeAllRefreshTokensForUser(stored.user_id);
    throw new UnauthorizedException(
      "Refresh token reuse detected. All sessions revoked."
    );
  }

  if (new Date(stored.expires_at) < new Date()) {
    await tokenModel.revokeRefreshToken(stored.id);
    throw new UnauthorizedException("Refresh token expired");
  }

  const newToken = generateRandomToken(64);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXP_IN_MILLISECONDS);
  const saved = await tokenModel.saveRefreshToken({
    id: stored.user_id,
    token: newToken,
    expiresAt,
    meta: { userAgent, ip },
  });
  await tokenModel.revokeRefreshToken(stored.id, saved.id);

  const accessToken = signAccessToken({
    id: stored.user_id,
    role: stored.role,
  });
  return { accessToken, refreshToken: newToken };
}

export async function getProfile(id: number) {
  const user = await userModel.getUserById(id);
  return user;
}

export async function logoutUser(token: string) {
  try {
    if (token) {
      const stored = await tokenModel.findRefreshTokenByHash(token);
      if (stored) await tokenModel.revokeRefreshToken(stored.id);
    }
    return { message: "Logout Successful" };
  } catch (err: any) {
    return { message: "Logout Failed" };
  }
}

export async function getFailedLogins({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  return await userModel.getFailedLogins({ page, limit });
}
