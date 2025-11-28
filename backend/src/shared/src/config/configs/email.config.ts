import { registerAs } from '../register-as';

export const emailConfig = registerAs('email', (env) => ({
  user: env.EMAIL_USER,
  pass: env.EMAIL_PASS,
}));
