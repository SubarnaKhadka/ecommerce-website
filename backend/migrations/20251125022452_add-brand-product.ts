import { type PoolClient } from "pg";

export async function up(db: PoolClient) {
  await db.query(
    `ALTER TABLE product ADD COLUMN IF NOT EXISTS brand VARCHAR(255)`
  );
}

export async function down(db: PoolClient) {
  await db.query(`ALTER TABLE product DROP COLUMN IF EXISTS brand`);
}
