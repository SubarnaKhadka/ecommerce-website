import type { Response, Request, NextFunction } from 'express';
import { instanceToPlain } from 'class-transformer';
import { ObjectId } from 'mongodb';

interface TransformOptions {
  stringifyMongoIds?: boolean;
  excludeTenant?: boolean;
}

/**
 * Recursively transform object/array:
 * - Convert _id (ObjectId) to string
 * - Remove tenant_id
 */
function transformObject<T>(obj: T, options: TransformOptions = {}): T {
  const { stringifyMongoIds = true, excludeTenant = true } = options;

  if (Array.isArray(obj)) {
    return obj.map((item) => transformObject(item, options)) as T;
  }

  if (obj && typeof obj === 'object') {
    const newObj: Record<string, unknown> = {};

    for (const key of Object.keys(obj)) {
      const value = (obj as Record<string, unknown>)[key];

      if (excludeTenant && key === 'tenant_id') {
        continue;
      }

      if (stringifyMongoIds && key === '_id' && value instanceof ObjectId) {
        newObj[key] = value.toString();
      } else {
        newObj[key] = transformObject(value, options);
      }
    }

    return newObj as T;
  }

  return obj;
}

/**
 * Wraps res.json to automatically transform DTOs
 * Excludes all fields marked with @Exclude({ toPlainOnly: true })
 */
export const transformResponse = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);

  res.json = (data: unknown) => {
    const transformed =
      typeof data === 'object' && data !== null ? instanceToPlain(transformObject(data)) : data;
    return originalJson(transformed);
  };

  next();
};
