import { type PoolClient } from "pg";

export async function up(db: PoolClient) {
  await db.query(
    `
    ALTER TABLE product ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
    UPDATE product SET slug = substring(md5(random()::text || id::text) for 16) WHERE slug IS NULL;
    ALTER TABLE product ALTER COLUMN slug SET NOT NULL;
    ALTER TABLE product ADD CONSTRAINT unique_slug UNIQUE (slug);
    `
  );
}

export async function down(db: PoolClient) {
  await db.query(`
    ALTER TABLE product DROP CONSTRAINT IF EXISTS unique_slug;
    ALTER TABLE product DROP COLUMN IF EXISTS slug;
    `);
}
