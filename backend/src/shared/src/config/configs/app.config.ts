import { registerAs } from "../register-as";

export const appConfig = registerAs("app", (env) => ({
  port: env.HTTP_PORT,
  app_env: env.APP_ENV,
  name: env.APP_NAME,
}));
