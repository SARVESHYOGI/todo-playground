import { Catch, HttpException, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import type { Response } from "express";

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
 * Mirrors the express errorHandler: validation failures answer `{ errors: [] }`,
 * driver failures map to 409/400, and nothing internal reaches the client.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const reply = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (payload && typeof payload === "object") {
        const body = payload as Record<string, unknown>;

        if (Array.isArray(body.errors)) {
          reply.status(status).json({ errors: body.errors });
          return;
        }

        if (typeof body.error === "string") {
          // Nest's own "no route matched" 404 arrives as
          // { message: "Cannot GET /x", error: "Not Found" }; the siblings answer
          // { error: "Not found" } for that case.
          if (
            status === 404 &&
            body.error === "Not Found" &&
            typeof body.message === "string" &&
            body.message.startsWith("Cannot ")
          ) {
            reply.status(404).json({ error: "Not found" });
            return;
          }

          reply.status(status).json({ error: body.error });
          return;
        }
      }

      const message =
        typeof payload === "string" ? payload : exception.message || "Internal server error";
      reply.status(status).json({ error: message });
      return;
    }

    const code = findErrorCode(exception);

    if (code === UNIQUE_VIOLATION || /duplicate key value|unique constraint/i.test(errorText(exception))) {
      reply.status(409).json({ error: "Resource already exists" });
      return;
    }

    if (code === FOREIGN_KEY_VIOLATION) {
      reply.status(400).json({ error: "Referenced resource does not exist" });
      return;
    }

    console.error(exception);
    reply.status(500).json({ error: "Internal server error" });
  }
}
