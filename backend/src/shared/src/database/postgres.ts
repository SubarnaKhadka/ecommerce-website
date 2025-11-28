import { Pool } from 'pg';
import { config } from '../config';

const {
  db_host: host,
  db_port: port,
  db_user: user,
  db_password: password,
  db_name: database,
} = config.database;

export function createPgConnection(dbName: string) {
  return new Pool({
    host,
    port,
    user,
    password,
    database: dbName,
  });
}

export const pgPool = createPgConnection(database);
