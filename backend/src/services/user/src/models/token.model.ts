import { type PoolClient } from "pg";
import { hashToken, queryDb } from "shared";

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
  const tokenHash = hashToken(token);
  const query = `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`;
  const results = await queryDb(
    query,
    [id, tokenHash, expiresAt, meta?.userAgent, meta?.ip],
    options
  );
  return results.rows?.[0];
}

export async function findRefreshTokenByHash(token: string) {
  const tokenHash = hashToken(token);
  const results = await queryDb(
    `SELECT * FROM refresh_tokens WHERE token_hash=$1`,
    [tokenHash]
  );
  const row = results?.rows?.[0];
  return row;
}

export async function revokeRefreshToken(
  id: string,
  replacedBy?: string | null
) {
  await queryDb(
    `UPDATE refresh_tokens SET revoked=true,replacedBy=$2 WHERE id=$1`,
    [id, replacedBy]
  );
}

export async function revokeAllRefreshTokensForUser(userId: string) {
  await queryDb(`UPDATE refresh_tokens SET revoked=true WHERE user_id = $1`, [
    userId,
  ]);
}

export async function recordFailedLogin(userId: number | null, ip?: string) {
  const results = await queryDb(
    `INSERT INTO failed_logins (user_id, ip_address) VALUES ($1,$2) RETURNING *`,
    [userId, ip]
  );
  return results?.rows?.[0];
}
