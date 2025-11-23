import { type PoolClient } from "pg";
import { WithId, Document } from "mongodb";
import { IPaginationResult, mongoDb, queryDb } from "shared";

import { UserDto } from "../dtos/user.dto";
import { ICreateUser } from "../interfaces/user.interface";

export async function getUserByEmail(
  email: string,
  options?: {
    client: PoolClient;
  }
) {
  const query = "SELECT * FROM site_user WHERE email_address = $1";
  const results = await queryDb(query, [email], options);
  const row = results?.rows?.[0];
  if (!row) return null;
  return new UserDto(row);
}

export async function getUserById(
  id: number,
  options?: {
    client?: PoolClient;
  }
) {
  const query = "SELECT * FROM site_user WHERE id = $1";
  const results = await queryDb(query, [id], options);
  const row = results?.rows?.[0];
  if (!row) return null;
  return new UserDto(row);
}

export async function getUserByRefreshToken(refreshToken: string) {
  const query = "SELECT * FROM site_user WHERE refresh_token=$1";
  const results = await queryDb(query, [refreshToken]);
  const row = results?.rows?.[0];
  if (!row) return null;
  return new UserDto(row);
}

export async function createUser(
  { email, phone, passwordHash }: ICreateUser & { passwordHash: string },
  options?: {
    client?: PoolClient;
  }
) {
  const query =
    "INSERT INTO site_user(email_address,phone_number,password) VALUES($1,$2,$3) RETURNING id,email_address";

  const results = await queryDb(query, [email, phone, passwordHash], options);
  const row = results?.rows?.[0];
  if (!row) return null;
  return new UserDto(row);
}

export async function getFailedLogins({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<IPaginationResult<WithId<Document>>> {
  const skip = (page - 1) * limit;

  const data = await mongoDb
    .collection("failed_logins")
    .find({})
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await mongoDb.collection("failed_logins").countDocuments();
  const totalPages = Math.ceil(total / limit);

  return { data, pagination: { page, totalPages, total } };
}
