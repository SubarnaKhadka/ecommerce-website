import { type PoolClient } from "pg";

export async function up(db: PoolClient) {
  await db.query(
    `ALTER TABLE site_user ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'customer';`
  );
}

export async function down(db: PoolClient) {
  await db.query(`ALTER TABLE site_user DROP COLUMN role;`);
}
