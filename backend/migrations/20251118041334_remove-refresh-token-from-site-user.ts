import { type PoolClient } from "pg";

export async function up(db: PoolClient) {
  await db.query(
    `ALTER TABLE site_user DROP COLUMN IF EXISTS refresh_token CASCADE`
  );
}

export async function down(db: PoolClient) {
  // TODO: write migration down logic
}
