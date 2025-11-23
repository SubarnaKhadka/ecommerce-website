import "reflect-metadata";
import { MetadataStorage, ValidationTypes } from "class-validator";

function getMetadataStorage(): MetadataStorage {
  return ((global as any).classValidatorMetadataStorage ??=
    require("class-validator/cjs/metadata/MetadataStorage").getMetadataStorage());
}

export function PartialType<T extends new (...args: any[]) => any>(
  BaseClass: T
) {
  class PartialClass extends BaseClass {}

  const metadataStorage = getMetadataStorage();

  const validations = (metadataStorage as any).getTargetValidationMetadatas(
    BaseClass,
    BaseClass.prototype,
    false
  );

  for (const meta of validations) {
    metadataStorage.addValidationMetadata({
      ...meta,
      target: PartialClass,
    });

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
  }
  return PartialClass;
}
