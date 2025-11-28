import type { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import type { ValidationError } from 'class-validator';
import { validate as classValidate } from 'class-validator';
import { UnprocessableEntityException } from './exceptions';
import { flattenErrors } from './helpers/flatten-errror';

export enum ValidationSource {
  BODY = 'body',
  QUERY = 'query',
  PARAM = 'params',
  HEADER = 'headers',
}

/**
 * Middleware to validate DTO using class-validator
 * @param DTOClass - class-validator DTO class
 * @param source - where to validate (body/query/params/headers)
 */
export const validator =
  <T extends object>(DTOClass: new () => T, source: ValidationSource = ValidationSource.BODY) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dtoInstance = plainToInstance(DTOClass, req[source]);

      const errors: ValidationError[] = await classValidate(dtoInstance, {
        whitelist: true,
      });

      if (errors.length > 0) {
        const messages = flattenErrors(errors);

        return next(new UnprocessableEntityException('Validation Failed', messages));
      }

      if (!req.validated) {
        req.validated = {};
      }

      req.validated[source] = dtoInstance;
      return next();
    } catch (err) {
      next(err);
    }
  };
