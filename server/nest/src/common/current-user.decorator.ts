import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { AuthedRequest } from "./auth.guard";

/** Reads the id the `AuthGuard` attached to the request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number =>
    context.switchToHttp().getRequest<AuthedRequest>().userId
);
