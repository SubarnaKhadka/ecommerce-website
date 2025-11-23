import { type PoolClient } from "pg";

export async function up(db: PoolClient) {
  await db.query(
    `ALTER TABLE variation 
    ADD CONSTRAINT uq_variation_category_name UNIQUE(category_id,name);
    ALTER TABLE variation_option
    ADD CONSTRAINT uq_variation_option UNIQUE (variation_id, value);
    `
  );
}

export async function down(db: PoolClient) {
  // TODO: write migration down logic
}
