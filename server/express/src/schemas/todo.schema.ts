import type { ObjectSchema } from "../utils/validation.ts";

export const todoCreateSchema: ObjectSchema = {
  title: { type: "string", required: true, minLength: 1, maxLength: 200 },
  description: { type: "string", maxLength: 2000, nullable: true },
};

export const todoUpdateSchema: ObjectSchema = {
  title: { type: "string", minLength: 1, maxLength: 200 },
  description: { type: "string", maxLength: 2000, nullable: true },
  completed: { type: "boolean" },
};
