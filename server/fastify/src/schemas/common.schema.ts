export interface IdParams {
  id: string;
}

/** Positive integer as a path segment: "abc" and "0" both fail validation. */
export const idParamsSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: { type: "string", pattern: "^[1-9][0-9]*$" },
  },
} as const;

/**
 * The `{ error }` envelope the routes and the error handler return for a 4xx.
 * Declaring it on a route lets Fastify type `reply.code()` for that status.
 */
export const errorResponseSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
  },
} as const;
