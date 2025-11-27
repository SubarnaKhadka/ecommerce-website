import { type PoolClient } from "pg";
import { WithId, Document } from "mongodb";
import { getTenantContext, IPaginationResult, mongoDb, queryDb } from "shared";

import { UserDto } from "../dtos/user.dto";
import { ICreateUser } from "../interfaces/user.interface";

export async function getUserByEmail(
  email: string,
  options?: {
    client: PoolClient;
  }
) {
  const { tenantId } = getTenantContext();
  const query =
    "SELECT * FROM site_user WHERE email_address = $1 AND tenant_id=$2";
  const results = await queryDb(query, [email, tenantId], options);
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
  const { tenantId } = getTenantContext();
  const query = "SELECT * FROM site_user WHERE id = $1 AND tenant_id=$2";
  const results = await queryDb(query, [id, tenantId], options);
  const row = results?.rows?.[0];
  if (!row) return null;
  return new UserDto(row);
}

export async function getUserByRefreshToken(refreshToken: string) {
  const { tenantId } = getTenantContext();
  const query =
    "SELECT * FROM site_user WHERE refresh_token=$1 AND tenant_id=$2";
  const results = await queryDb(query, [refreshToken, tenantId]);
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
  const { tenantId } = getTenantContext();
  const query =
    "INSERT INTO site_user(email_address,phone_number,password,tenant_id) VALUES($1,$2,$3,$4) RETURNING id,email_address";

  const results = await queryDb(
    query,
    [email, phone, passwordHash, tenantId],
    options
  );
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
  const { tenantId } = getTenantContext();
  const skip = (page - 1) * limit;

  const data = await mongoDb
    .collection("failed_logins")
    .find(
      {
        tenant_id: tenantId,
      },
      { projection: { tenant_id: 0 } }
    )
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await mongoDb.collection("failed_logins").countDocuments();
  const totalPages = Math.ceil(total / limit);

  return { data, pagination: { page, totalPages, total } };
}
