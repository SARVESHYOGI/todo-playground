import type { ObjectSchema } from "../common/validation";

export interface TodoCreateBody {
  title: string;
  description?: string | null;
}

export interface TodoUpdateBody {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

export const todoCreateSchema: ObjectSchema = {
  title: { type: "string", required: true, minLength: 1, maxLength: 200 },
  description: { type: "string", maxLength: 2000, nullable: true },
};

export const todoUpdateSchema: ObjectSchema = {
  title: { type: "string", minLength: 1, maxLength: 200 },
  description: { type: "string", maxLength: 2000, nullable: true },
  completed: { type: "boolean" },
};
