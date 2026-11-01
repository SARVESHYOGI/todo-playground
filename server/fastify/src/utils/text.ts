/**
 * The express sibling trims every string field inside its validation
 * middleware, so the two stacks store identical data. Fastify validates with
 * JSON Schema instead, which never mutates input — this does the trimming.
 */
export function trimStrings<T extends object>(input: T): T {
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    output[key] = typeof value === "string" ? value.trim() : value;
  }

  return output as T;
}
