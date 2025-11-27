import { generatePartialUpdate, ITenant, queryDb } from "shared";

export async function createTenant({
  name,
  domain,
  dedicated_db,
  db_name,
}: ITenant) {
  const query =
    "INSERT INTO tenants(name,domain,dedicated_db,db_name) VALUES($1,$2,$3,$4) RETURNING id";
  const results = await queryDb(query, [name, domain, dedicated_db, db_name]);
  return results?.rows?.[0];
}

export async function updateTenant({
  name,
  domain,
  dedicated_db,
  db_name,
  id,
}: Partial<ITenant>) {
  const partialUpdate = generatePartialUpdate({
    name,
    domain,
    dedicated_db,
    db_name,
  });
  if (!partialUpdate) return;

  const query = [
    "UPDATE tenants SET",
    partialUpdate.setString,
    `WHERE id=$${partialUpdate.values.length + 1} RETURNING id`,
  ].join(" ");

  const results = await queryDb(query, [...partialUpdate.values, id]);
  return results?.rows?.[0];
}

export async function deleteTenant(id: number) {
  const query = "DELETE FROM tenants WHERE id=$1 RETURNING id";
  const results = await queryDb(query, [id]);
  return results?.rows?.[0];
}
