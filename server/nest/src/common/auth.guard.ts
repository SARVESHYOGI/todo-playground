import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import type { Request } from "express";
import { verifyToken } from "./token";

export type AuthedRequest = Request & { userId: number };

/**
 * The express sibling's `requireAuth`, as a route guard. Apply it per handler
 * (`@UseGuards(AuthGuard)`) so register/login/health stay public.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const header = request.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedException({ error: "Missing or invalid Authorization header" });
    }

    const token = header.slice("Bearer ".length).trim();
    const result = verifyToken(token);
    if (!result) {
      throw new UnauthorizedException({ error: "Invalid or expired token" });
    }

    request.userId = result.userId;
    return true;
  }
}
