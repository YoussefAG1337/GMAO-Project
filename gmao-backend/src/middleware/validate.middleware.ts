import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as any;
      req.body = parsed.body;

      if (parsed.query) {
        for (const key of Object.keys(req.query)) {
          delete (req.query as any)[key];
        }
        Object.assign(req.query, parsed.query);
      }

      if (parsed.params) {
        for (const key of Object.keys(req.params)) {
          delete (req.params as any)[key];
        }
        Object.assign(req.params, parsed.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        const errorMessage =
          'Validation failed: ' + errors.map((e: any) => `${e.path} (${e.message})`).join(', ');
        return next(new BadRequestError(errorMessage));
      }
      next(error);
    }
  };
};
