import { AsyncLocalStorage } from 'async_hooks';
import type { Pool } from 'pg';
import type { ITenant } from '../types';
import { createPgConnection, pgPool } from '../database';

export const tenantContext = new AsyncLocalStorage<{
  tenantId: number;
  poolConnection: Pool;
}>();

export const connections: Record<string, Pool> = {};

export function getTenantContext() {
  const store = tenantContext.getStore();
  if (!store) throw new Error('No tenant context available');
  return store;
}

export async function getTenantConnection(tenant: ITenant): Promise<Pool> {
  if (!tenant.dedicated_db) {
    return pgPool;
  }

  if (!connections[tenant.db_name]) {
    connections[tenant.db_name] = createPgConnection(tenant.db_name);
  }

  return connections[tenant.db_name];
}
