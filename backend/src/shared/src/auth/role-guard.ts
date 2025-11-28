import type { Request, Response, NextFunction } from 'express';
import { ForbiddenException, UnauthorizedException } from 'shared';

export function roleGuard(...allowedRoles: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenException();
    }
    next();
  };
}
