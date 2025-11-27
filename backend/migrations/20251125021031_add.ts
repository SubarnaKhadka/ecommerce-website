import { type PoolClient } from "pg";

export async function up(db: PoolClient) {
  await db.query(`
  ALTER TABLE site_user ADD COLUMN IF NOT EXISTS metadata JSONB;
  ALTER TABLE product ADD COLUMN IF NOT EXISTS metadata JSONB;
  ALTER TABLE product_item ADD COLUMN IF NOT EXISTS metadata JSONB;
  `);
}

export async function down(db: PoolClient) {
  await db.query(`
  ALTER TABLE site_user DROP COLUMN IF  EXISTS metadata;
  ALTER TABLE product DROP COLUMN IF  EXISTS metadata;
  ALTER TABLE product_item DROP COLUMN IF  EXISTS metadata;
  `);
}
