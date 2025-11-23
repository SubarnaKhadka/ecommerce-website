import { Response, Request, NextFunction } from "express";
import { instanceToPlain } from "class-transformer";
import { ObjectId } from "mongodb";

function stringifyMongoId<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(stringifyMongoId) as T;
  }
  if (obj && typeof obj === "object") {
    const newObj: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      if (
        key === "_id" &&
        (obj as Record<string, unknown>)[key] instanceof ObjectId
      ) {
        newObj[key] = (
          (obj as Record<string, unknown>)[key] as ObjectId
        ).toString();
      } else {
        newObj[key] = stringifyMongoId((obj as Record<string, unknown>)[key]);
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
export const transformResponse = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json.bind(res);

  res.json = (data: unknown) => {
    const transformed =
      typeof data === "object" && data !== null
        ? instanceToPlain(stringifyMongoId(data))
        : data;
    return originalJson(transformed);
  };

  next();
};
