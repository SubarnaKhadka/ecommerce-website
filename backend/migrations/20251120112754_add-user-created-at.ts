import { type PoolClient } from "pg";

export async function up(db: PoolClient) {
  await db.query(
    `ALTER TABLE site_user ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`
  );
}

export async function down(db: PoolClient) {
  await db.query(`ALTER TABLE site_user DROP COLUMN created_at;`);
}
