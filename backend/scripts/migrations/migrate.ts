import fs from "fs";
import path from "path";
import { pgPool } from "shared";

async function ensureMigrationTable() {
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      run_on TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

async function getExecutedMigrations(): Promise<string[]> {
  const result = await pgPool.query(
    `SELECT name FROM migrations ORDER BY name ASC`
  );
  return result.rows.map((row) => row.name);
}

function loadMigrationFiles(): string[] {
  const migrationsDir = path.join(process.cwd(), "migrations");
  if (!fs.existsSync(migrationsDir)) return [];
  return fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".ts"))
    .sort();
}

async function runMigrations() {
  await ensureMigrationTable();

  const executed = await getExecutedMigrations();
  const available = loadMigrationFiles();

  const pending = available.filter((m) => !executed.includes(m));

  if (pending.length === 0) {
    console.log("✅ No pending migrations.");
    process.exit(0);
  }

  console.log(`Pending migrations:`, pending);

  for (const file of pending) {
    const filePath = path.join(process.cwd(), "migrations", file);
    console.log(`Running: ${file}`);
    const migration = await import(filePath);

    const client = await pgPool.connect();

    try {
      await client.query("BEGIN");
      await migration.up(client);
      await client.query(`INSERT INTO migrations (name) VALUES ($1)`, [file]);
      await client.query("COMMIT");
      console.log(`✅ Completed: ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(`❌ Failed: ${file}`);
      console.error(error);
      process.exit(1);
    } finally {
      client.release();
    }
  }

  console.log("All migrations executed.");
  process.exit(0);
}

runMigrations()
  .then(() => pgPool.end())
  .catch((err) => {
    console.error(err);
    pgPool.end();
    process.exit(1);
  });
