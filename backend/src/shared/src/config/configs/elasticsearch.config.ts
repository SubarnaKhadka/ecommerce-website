import { registerAs } from '../register-as';

export const esConfig = registerAs('elastic', (env) => ({
  url: env.ELASTIC_URL,
  user: env.ELASTIC_USER,
  password: env.ELASTIC_PASSWORD,
}));
