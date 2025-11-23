import "reflect-metadata";

export function OmitType<T extends { new (...args: any[]): any }>(
  BaseClass: T,
  keysToOmit: (keyof InstanceType<T>)[]
) {
  const omitted = new Set(keysToOmit as string[]);

  class OmitClass {
    constructor(...args: any[]) {
      const data = args[0] ?? {};
      Object.assign(this, data);
    }
  }

  const propertyNames = Object.getOwnPropertyNames(BaseClass.prototype);

  for (const propertyKey of propertyNames) {
    if (propertyKey === "constructor") continue;
    if (omitted.has(propertyKey)) continue;

    const descriptor = Object.getOwnPropertyDescriptor(
      BaseClass.prototype,
      propertyKey
    );
    if (descriptor) {
      Object.defineProperty(OmitClass.prototype, propertyKey, descriptor);
    }

    const keys = Reflect.getMetadataKeys(BaseClass.prototype, propertyKey);
    for (const metadataKey of keys) {
      const metadata = Reflect.getMetadata(
        metadataKey,
        BaseClass.prototype,
        propertyKey
      );
      Reflect.defineMetadata(
        metadataKey,
        metadata,
        OmitClass.prototype,
        propertyKey
      );
    }
  }

  return OmitClass as T;
}
