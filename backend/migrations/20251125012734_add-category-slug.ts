import { type PoolClient } from "pg";

export async function up(db: PoolClient) {
  await db.query(
    "ALTER TABLE product_category ADD COLUMN IF NOT EXISTS slug VARCHAR(255) NOT NULL"
  );
  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'product_category_slug_key'
      ) THEN
        ALTER TABLE product_category
        ADD CONSTRAINT product_category_slug_key UNIQUE (slug);
      END IF;
    END$$;
`);
}

export async function down(db: PoolClient) {
  await db.query(`
    ALTER TABLE product_category
    DROP CONSTRAINT IF EXISTS product_category_slug_key;
  `);
  await db.query("ALTER TABLE DROP COLUMN IF NOT EXUSTS slug");
}
