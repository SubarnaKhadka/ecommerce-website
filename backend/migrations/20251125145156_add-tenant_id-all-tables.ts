import { type PoolClient } from "pg";

export async function up(db: PoolClient) {
  const { rows } = await db.query(`
      SELECT 'ALTER TABLE ' || tablename || 
             ' ADD COLUMN IF NOT EXISTS tenant_id BIGINT NOT NULL REFERENCES tenants(id);' AS sql_stmt
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename NOT IN ('migrations','tenants');
    `);

  for (const row of rows) {
    await db.query(row.sql_stmt);
  }
}

export async function down(db: PoolClient) {
  // TODO: write migration down logic
}
