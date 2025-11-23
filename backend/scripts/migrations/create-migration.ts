import fs from "fs";
import path from "path";

const name = process.argv[2];

if (!name) {
  console.error("❌ Please provide a migration name.");
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const fileName = `${timestamp}_${name}.ts`;

const template = `
import { type PoolClient } from "pg";

export async function up(db: PoolClient) {
  // TODO: write migration up logic
}

export async function down(db: PoolClient) {
  // TODO: write migration down logic
}
`;

const migrationsDir = path.join(process.cwd(), "migrations");

if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir);
}

fs.writeFileSync(path.join(migrationsDir, fileName), template.trim());

console.log(`✅ Created migration: migrations/${fileName}`);
