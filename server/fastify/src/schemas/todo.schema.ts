export interface TodoCreateBody {
  title: string;
  description?: string | null;
}

export interface TodoUpdateBody {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

export const todoCreateSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title"],
  properties: {
    title: { type: "string", minLength: 1, maxLength: 200 },
    description: { type: ["string", "null"], maxLength: 2000 },
  },
} as const;

export const todoUpdateSchema = {
  type: "object",
  additionalProperties: false,
  minProperties: 1,
  properties: {
    title: { type: "string", minLength: 1, maxLength: 200 },
    description: { type: ["string", "null"], maxLength: 2000 },
    completed: { type: "boolean" },
  },
} as const;

/** Fastify serializes with this, so only these columns can ever leave the API. */
export const todoResponseSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    title: { type: "string" },
    description: { type: ["string", "null"] },
    completed: { type: "boolean" },
    authorId: { type: "integer" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
} as const;

export const todoListResponseSchema = {
  type: "array",
  items: todoResponseSchema,
} as const;
