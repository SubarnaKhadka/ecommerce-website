import { execSync } from "child_process";

import dotenv from "dotenv";
dotenv.config();

const { DB_USER, DB_HOST, DB_PORT, DB_NAME } = process.env;

try {
  const checkCommand = `psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'"`;
  const result = execSync(checkCommand).toString().trim();

  if (result !== "1") {
    execSync(`createdb -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} ${DB_NAME}`);
    console.log(`✅ Database "${DB_NAME}" created successfully!`);
  } else {
    console.log(`✅ Database "${DB_NAME}" already exists.`);
  }

  execSync(
    `psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -f ./init.sql`,
    {
      stdio: "inherit",
    }
  );
  console.log(`✅ Database schema applied successfully!`);
} catch (err) {
  console.error("❌ Error initializing database:", err);
}
