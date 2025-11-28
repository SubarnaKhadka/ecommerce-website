import { registerAs } from '../register-as';

export const authConfig = registerAs('auth', (env) => ({
  issuer: env.JWT_ISSUER,
  accessExp: env.ACCESS_TOKEN_EXP,
  refreshExp: env.REFRESH_TOKEN_EXP,
  secret: env.SECRET_KEY,
  failedWindowMinutes: env.FAILED_WINDOW_MINUTES,
  maxFailedAttempt: env.MAX_FAILED_ATTEMPT,
  blockMinutes: env.BLOCK_MINUTES,
}));
