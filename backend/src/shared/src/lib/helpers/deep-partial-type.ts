import "reflect-metadata";
import { ValidationTypes, getMetadataStorage } from "class-validator";

function getMetadataStorageSafe() {
  return ((global as any).classValidatorMetadataStorage ??=
    getMetadataStorage());
}

function isClass(v: any) {
  return typeof v === "function" && /^\s*class\s+/.test(v.toString());
}

export function DeepPartialType<T extends new (...args: any[]) => any>(
  BaseClass: T
) {
  class PartialClass extends BaseClass {}

  const metadataStorage = getMetadataStorageSafe();
  const validations = (metadataStorage as any).getTargetValidationMetadatas(
    BaseClass,
    BaseClass.prototype,
    false
  );

  for (const meta of validations) {
    metadataStorage.addValidationMetadata({
      type: ValidationTypes.CONDITIONAL_VALIDATION,
      target: PartialClass,
      propertyName: meta.propertyName,
      constraints: [(_obj: any, value: any) => value !== undefined],
      validationTypeOptions: {},
      constraintCls: undefined,
      message: "",
      groups: [],
      each: false,
    } as any);

    const designType = Reflect.getMetadata(
      "design:type",
      BaseClass.prototype,
      meta.propertyName
    );
    if (isClass(designType)) {
      const NestedPartial = DeepPartialType(designType);
      Object.defineProperty(PartialClass.prototype, meta.propertyName, {
        value: new NestedPartial(),
        writable: true,
        configurable: true,
      });
    }
  }

  return PartialClass;
}
