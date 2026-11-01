import type { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { verifyToken } from "../utils/token.ts";

declare module "fastify" {
  interface FastifyRequest {
    userId: number;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

/**
 * `requireAuth` from the express sibling, expressed as a reusable preHandler.
 * Wrapped in fastify-plugin so the decorator lands on the root instance and is
 * visible to every route plugin registered afterwards.
 */
export const authPlugin = fp(
  async (app) => {
    app.decorateRequest("userId", 0);

    app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
      const header = request.headers.authorization;
      if (!header || !header.startsWith("Bearer ")) {
        await reply.code(401).send({ error: "Missing or invalid Authorization header" });
        return;
      }

      const token = header.slice("Bearer ".length).trim();
      const result = verifyToken(token);
      if (!result) {
        await reply.code(401).send({ error: "Invalid or expired token" });
        return;
      }

      request.userId = result.userId;
    });
  },
  { name: "auth" }
);
