import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from './jwt';
import { UnauthorizedException } from 'shared';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) throw new UnauthorizedException();

  const [_, token] = authHeader.split(' ');

  try {
    const payload = verifyAccessToken(token);

    if (!payload) throw new UnauthorizedException();

    req.user = {
      id: Number(payload.id),
      role: payload.role,
    };
    next();
  } catch (err) {
    throw new UnauthorizedException();
  }
}

export async function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    if (req.user.role && req.user.role === role) return next();
    throw new UnauthorizedException();
  };
}
