import { ITenant } from "shared/types";
import { pgPool } from "../database";
import { redisClient } from "../redis";

export async function getTanents() {
  const results = await pgPool.query(`SELECT * from tenants`);
  return results?.rows;
}

export async function getTenantRegistry(): Promise<ITenant[]> {
  const cachedTenants = await redisClient.get("tenants");

  if (cachedTenants) {
    return JSON.parse(cachedTenants);
  }
  const tenants = await getTanents();
  await redisClient.set("tenants", JSON.stringify(tenants));
  return tenants;
}
