import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { env } from "./config/env.ts";
import { authPlugin } from "./plugins/auth.plugin.ts";
import { registerErrorHandler } from "./plugins/error-handler.plugin.ts";
import todoRoutes from "./routes/todo.routes.ts";
import { publicUserRoutes, userRoutes } from "./routes/user.routes.ts";

/**
 * Builds a Fastify instance without listening, so tests can drive it through
 * `app.inject()` and `server.ts` owns the actual socket.
 */
export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: env.nodeEnv === "test" ? false : { level: env.logLevel },
    ajv: {
      customOptions: {
        // Off on purpose: the express sibling rejects "123" for a string
        // field, and coercion would silently accept it here.
        coerceTypes: false,
        removeAdditional: false,
        useDefaults: false,
        allErrors: true,
      },
    },
  });

  registerErrorHandler(app);

  app.register(cors, {
    origin: env.corsOrigin,
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  });

  // Must be registered before the route plugins that use `app.authenticate`.
  app.register(authPlugin);

  app.get("/health", async () => ({ status: "ok" }));

  app.register(todoRoutes, { prefix: "/todos" });
  app.register(publicUserRoutes, { prefix: "/users" });
  app.register(userRoutes, { prefix: "/users" });

  return app;
}
