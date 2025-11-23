export function registerAs<Name extends string, T>(
  name: Name,
  factory: (env: Record<string, any>) => T
) {
  return { name, factory };
}
