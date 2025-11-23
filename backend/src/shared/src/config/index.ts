import "../load-env";
import configs from "./configs";
import { envSchema } from "./env.schema";

type ConfigFromArray<T extends { name: string; factory: (env: any) => any }[]> =
  {
    [K in T[number] as K["name"]]: ReturnType<K["factory"]>;
  };

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(parsed.error.format());
  process.exit(1);
}

const conf: Partial<ConfigFromArray<typeof configs>> = {};
for (const cfg of configs) {
  conf[cfg.name] = cfg.factory(parsed.data) as any;
}

export const config = conf as ConfigFromArray<typeof configs>;
