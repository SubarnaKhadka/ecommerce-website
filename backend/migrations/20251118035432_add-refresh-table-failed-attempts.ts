import { type PoolClient } from "pg";

export async function up(db: PoolClient) {
  await db.query(`
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NULL REFERENCES site_user(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT false,
    replaced_by BIGINT NULL REFERENCES refresh_tokens(id) ON DELETE SET NULL,
    user_agent TEXT NULL,
    ip_address TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);

CREATE TABLE IF NOT EXISTS failed_logins (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NULL REFERENCES site_user(id) ON DELETE SET NULL,
  ip_address TEXT NULL,
  attempt_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_failed_logins_user_id ON failed_logins (user_id);
CREATE INDEX IF NOT EXISTS idx_failed_logins_ip_address ON failed_logins (ip_address);
    `);
}

export async function down(db: PoolClient) {
  // TODO: write migration down logic
}
