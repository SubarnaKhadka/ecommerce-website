import { type PoolClient } from "pg";
import { getTenantContext, hashToken, queryDb } from "shared";

export async function saveRefreshToken({
  id,
  token,
  expiresAt,
  meta,
  options,
}: {
  id: number;
  token: string;
  expiresAt: Date;
  meta?: { userAgent?: string; ip?: string };
  options?: {
    client?: PoolClient;
  };
}) {
  const { tenantId } = getTenantContext();
  const tokenHash = hashToken(token);
  const query = `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address,tenant_id)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  const results = await queryDb(
    query,
    [id, tokenHash, expiresAt, meta?.userAgent, meta?.ip, tenantId],
    options
  );
  return results.rows?.[0];
}

export async function findRefreshTokenByHash(token: string) {
  const { tenantId } = getTenantContext();
  const tokenHash = hashToken(token);
  const results = await queryDb(
    `SELECT * FROM refresh_tokens WHERE token_hash=$1 AND tenant_id=$2`,
    [tokenHash, tenantId]
  );
  return results?.rows?.[0];
}

export async function revokeRefreshToken(
  id: string,
  replacedBy?: string | null
) {
  const { tenantId } = getTenantContext();
  await queryDb(
    `UPDATE refresh_tokens SET revoked=true,replacedBy=$2 WHERE id=$1 AND tenant_id=$3`,
    [id, replacedBy, tenantId]
  );
}

export async function revokeAllRefreshTokensForUser(userId: string) {
  const { tenantId } = getTenantContext();
  await queryDb(
    `UPDATE refresh_tokens SET revoked=true WHERE user_id = $1 AND tenant_id=$2`,
    [userId, tenantId]
  );
}

export async function recordFailedLogin(userId: number | null, ip?: string) {
  const { tenantId } = getTenantContext();
  const results = await queryDb(
    `INSERT INTO failed_logins (user_id, ip_address,tenant_id) VALUES ($1,$2,$3) RETURNING *`,
    [userId, ip, tenantId]
  );
  return results?.rows?.[0];
}
