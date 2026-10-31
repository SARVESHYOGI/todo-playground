import type { NextFunction, Request, Response } from "express";

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

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const code = findErrorCode(err);

  if (code === UNIQUE_VIOLATION || /duplicate key value|unique constraint/i.test(errorText(err))) {
    res.status(409).json({ error: "Resource already exists" });
    return;
  }

  if (code === FOREIGN_KEY_VIOLATION) {
    res.status(400).json({ error: "Referenced resource does not exist" });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
