import { type PoolClient } from "pg";

export async function up(db: PoolClient) {
  await db.query(
    `ALTER TABLE site_user ALTER COLUMN phone_number DROP NOT NULL;`
  );
}

export async function down(db: PoolClient) {
  await db.query(
    `ALTER TABLE site_user ALTER COLUMN phone_number SET NOT NULL;`
  );
}
