import crypto from 'crypto';
import ms from 'ms';
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

import { config } from '../config';

const { issuer, accessExp, secret: secretKey } = config.auth;

interface IJwtPayload extends JwtPayload {
  id: number;
  roles: string[];
}

export function signAccessToken(payload: object) {
  const jti = crypto.randomUUID();
  const token = jwt.sign(payload, secretKey, {
    expiresIn: accessExp,
    issuer,
    jwtid: jti,
  } as jwt.SignOptions);

  return { token, jti, expiresIn: Number(ms(accessExp)) / 1000 };
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, secretKey, {
    issuer,
  }) as IJwtPayload;
}
