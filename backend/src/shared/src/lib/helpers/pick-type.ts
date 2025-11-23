import "reflect-metadata";
import { MetadataStorage } from "class-validator";

function getMetadataStorage(): MetadataStorage {
  return ((global as any).classValidatorMetadataStorage ??=
    require("class-validator/cjs/metadata/MetadataStorage").getMetadataStorage());
}

export function PickType<
  T extends new (...args: any[]) => any,
  K extends keyof InstanceType<T>
>(BaseClass: T, keys: readonly K[]) {
  class PickClass {}

  const metadataStorage = getMetadataStorage();

  for (const key of keys) {
    const type = Reflect.getMetadata(
      "design:type",
      BaseClass.prototype,
      key as string
    );
    Reflect.defineMetadata(
      "design:type",
      type,
      PickClass.prototype,
      key as string
    );
  }

  const validations = (metadataStorage as any).getTargetValidationMetadatas(
    BaseClass,
    BaseClass.prototype,
    false
  );

  for (const meta of validations) {
    if (keys.includes(meta.propertyName as K)) {
      metadataStorage.addValidationMetadata({
        ...meta,
        target: PickClass,
      });
    }
  }

  return PickClass;
}
