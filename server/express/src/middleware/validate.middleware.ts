import type { NextFunction, Request, Response } from "express";
import { validateObject, type ObjectSchema } from "../utils/validation.ts";

interface ValidateBodyOptions {
  requireAtLeastOne?: boolean;
}

export function validateBody(schema: ObjectSchema, options: ValidateBodyOptions = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { value, errors } = validateObject(schema, req.body);
    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }
    if (options.requireAtLeastOne && Object.keys(value).length === 0) {
      res.status(400).json({ errors: ["Request body must include at least one field"] });
      return;
    }
    req.body = value;
    next();
  };
}

export function validateIdParam(param = "id") {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = Number(req.params[param]);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      res.status(400).json({ errors: [`"${param}" must be a positive integer`] });
      return;
    }
    next();
  };
}
