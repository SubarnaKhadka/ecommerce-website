import { PoolClient } from "pg";
import { getTenantContext } from "../../tenant/tenant-context";

export async function queryDb(
  sql: string,
  params?: any[],
  options?: { client?: PoolClient }
) {
  const tenantContext = getTenantContext();
  const connection = options?.client ?? tenantContext.poolConnection;
  return await connection.query(sql, params);
}
