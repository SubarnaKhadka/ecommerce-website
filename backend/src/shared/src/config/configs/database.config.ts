import { registerAs } from '../register-as';

export const databaseConfig = registerAs('database', (env) => ({
  db_host: env.DB_HOST,
  db_port: env.DB_PORT,
  db_user: env.DB_USER,
  db_password: env.DB_PASSWORD,
  db_name: env.DB_NAME,

  mongo_uri: env.MONGO_URI,
  mongo_db_name: env.MONGO_DB_NAME,
}));
