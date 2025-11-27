import { type PoolClient } from "pg";

export async function up(db: PoolClient) {
  await db.query(`
    ALTER TABLE product_configuration
    ADD COLUMN IF NOT EXISTS variation_id BIGINT NOT NULL REFERENCES variation(id) ON DELETE CASCADE;
  `);

  await db.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'product_configuration_product_item_id_variation_option_id_key'
      ) THEN
        ALTER TABLE product_configuration
        DROP CONSTRAINT product_configuration_product_item_id_variation_option_id_key;
      END IF;
    END$$;
  `);

  await db.query(`
    ALTER TABLE product_configuration
    ADD CONSTRAINT product_configuration_product_item_id_variation_id_key
    UNIQUE (product_item_id, variation_id);
  `);
}

export async function down(db: PoolClient) {
  // TODO: write migration down logic
}
