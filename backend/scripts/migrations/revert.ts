import path from "path";
import { pgPool } from "shared";

async function revertMigration() {
  const result = await pgPool.query(
    `SELECT name FROM migrations ORDER BY id DESC LIMIT 1`
  );
  if (!result.rows.length) {
    console.log("No migrations to revert.");
    return;
  }
  const file = result.rows[0].name;
  const filePath = path.join(process.cwd(), "migrations", file);
  const migration = await import(filePath);
  if (!migration.down) {
    console.error("❌ Migration does not have a down() function");
    return;
  }

  const client = await pgPool.connect();
  try {
    console.log(`Reverting: ${file}`);
    await client.query("BEGIN");
    await migration.down(client);
    await client.query(`DELETE FROM migrations WHERE name = $1`, [file]);
    await client.query("COMMIT");
    console.log(`✅ Reverted: ${file}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(`❌ Failed to revert migration: ${file}`);
    console.error(err);
  } finally {
    client.release();
  }
}

revertMigration().finally(() => pgPool.end());
