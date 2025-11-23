import { ValidationError } from "class-validator";

export function flattenErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  const recurse = (errs: ValidationError[], parentPath = "") => {
    for (const err of errs) {
      const propertyPath = parentPath
        ? `${parentPath}.${err.property}`
        : err.property;

      if (err.constraints) {
        for (const msg of Object.values(err.constraints)) {
          messages.push(`${propertyPath}: ${msg}`);
        }
      }

      if (err.children && err.children.length > 0) {
        recurse(err.children, propertyPath);
      }
    }
  };

  recurse(errors);
  return messages;
}
