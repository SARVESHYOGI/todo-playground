import type { FastifyError, FastifyInstance } from "fastify";
import {
  toValidationMessages,
  type ValidationIssue,
} from "../utils/validation-errors.ts";

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

function findErrorCode(err: unknown): string | undefined {
  let current: unknown = err;
  for (let depth = 0; depth < 5 && current && typeof current === "object"; depth++) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string") return code;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

function errorText(err: unknown): string {
  if (err instanceof Error) return `${err.message} ${String(err.cause ?? "")}`;
  return String(err);
}

/**
 * Mirrors the express errorHandler: schema failures answer `{ errors: [] }`,
 * driver failures map to 409/400, and nothing internal reaches the client.
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error.validation) {
      reply.code(400).send({
        errors: toValidationMessages(error.validation as unknown as readonly ValidationIssue[]),
      });
      return;
    }

    const code = findErrorCode(error);

    if (code === UNIQUE_VIOLATION || /duplicate key value|unique constraint/i.test(errorText(error))) {
      reply.code(409).send({ error: "Resource already exists" });
      return;
    }

    if (code === FOREIGN_KEY_VIOLATION) {
      reply.code(400).send({ error: "Referenced resource does not exist" });
      return;
    }

    // Errors Fastify raises itself with a client-safe status (bad JSON, 404
    // from a plugin, etc.) keep their status and message.
    if (error.statusCode !== undefined && error.statusCode < 500) {
      reply.code(error.statusCode).send({ error: error.message });
      return;
    }

    request.log.error({ err: error }, "unhandled request error");
    reply.code(500).send({ error: "Internal server error" });
  });

  app.setNotFoundHandler((_request, reply) => {
    reply.code(404).send({ error: "Not found" });
  });
}
