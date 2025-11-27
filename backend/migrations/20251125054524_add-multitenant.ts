import { type PoolClient } from "pg";

export async function up(db: PoolClient) {
  await db.query(`
    CREATE TABLE tenants (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    dedicated_db BOOLEAN DEFAULT FALSE,
    db_name TEXT,
    created_at TIMESTAMP DEFAULT now()
)`);
}

export async function down(db: PoolClient) {
  // TODO: write migration down logic
}
