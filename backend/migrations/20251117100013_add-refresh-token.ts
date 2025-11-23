import { type PoolClient } from "pg";

export async function up(db: PoolClient) {
  await db.query(
    `ALTER TABLE site_user ADD COLUMN IF NOT EXISTS refresh_token TEXT`
  );
}

export async function down(db: PoolClient) {
  await db.query(`ALTER TABLE site_user DROP COLUMN IF EXISTS refresh_token`);
}
