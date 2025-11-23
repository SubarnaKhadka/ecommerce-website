import { PoolClient } from "pg";
import { pgPool } from "../../database/postgres";

export async function queryDb(
  sql: string,
  params: any[],
  options?: { client?: PoolClient }
) {
  return await (options?.client ?? pgPool).query(sql, params);
}
