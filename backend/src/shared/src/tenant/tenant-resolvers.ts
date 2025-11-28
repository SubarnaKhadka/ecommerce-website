import type { Request, Response, NextFunction } from 'express';

import { config } from '../config';
import { BadRequestException } from '../lib';
import { getTenantRegistry } from './tenant.model';
import { getTenantConnection, tenantContext } from '../tenant/tenant-context';

export const tenantResolver = async (req: Request, res: Response, next: NextFunction) => {
  let host = req.headers['x-tenant-domain']?.toString();

  if (!host) {
    if (config.app.app_env === 'development') {
      host = 'localhost';
    } else {
      throw new BadRequestException('Tenant domain missing');
    }
  }

  const tenantsRegistry = await getTenantRegistry();
  const tenant = tenantsRegistry.find((t) => t.domain === host);

  if (!tenant) {
    throw new BadRequestException('Tenant not found');
  }
  const poolConnection = await getTenantConnection(tenant);

  tenantContext.run({ tenantId: Number(tenant.id), poolConnection }, () => next());
};
