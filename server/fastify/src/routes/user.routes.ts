import type { FastifyPluginAsync } from "fastify";
import { errorResponseSchema, idParamsSchema, type IdParams } from "../schemas/common.schema.ts";
import {
  authResponseSchema,
  loginSchema,
  publicUserSchema,
  registerSchema,
  userUpdateSchema,
  type LoginBody,
  type RegisterBody,
  type UserUpdateBody,
} from "../schemas/user.schema.ts";
import { userService } from "../services/user.service.ts";
import { trimStrings } from "../utils/text.ts";

/**
 * Unauthenticated routes. Kept in their own plugin so the `authenticate`
 * preHandler in `userRoutes` cannot leak onto /register and /login.
 */
export const publicUserRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: RegisterBody }>(
    "/register",
    { schema: { body: registerSchema, response: { 201: authResponseSchema } } },
    async (request, reply) => {
      const result = await userService.register(trimStrings(request.body));

      if ("conflict" in result) {
        reply.code(409).send({ error: "Email is already registered" });
        return;
      }

      return reply.code(201).send(result);
    }
  );

  app.post<{ Body: LoginBody }>(
    "/login",
    { schema: { body: loginSchema, response: { 200: authResponseSchema } } },
    async (request, reply) => {
      const result = await userService.login(trimStrings(request.body));

      if (!result) {
        reply.code(401).send({ error: "Invalid email or password" });
        return;
      }

      return result;
    }
  );
};

/**
 * Authenticated routes. `requireSelf` becomes an explicit id comparison
 * because the ownership check is two lines and reads better inline.
 */
export const userRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.authenticate);

  app.get(
    "/me",
    { schema: { response: { 200: publicUserSchema, 404: errorResponseSchema } } },
    async (request, reply) => {
      const user = await userService.getbyId(request.userId);

      if (!user) {
        reply.code(404).send({ error: "User not found" });
        return;
      }

      return user;
    }
  );

  app.get<{ Params: IdParams }>(
    "/:id",
    { schema: { params: idParamsSchema, response: { 200: publicUserSchema } } },
    async (request, reply) => {
      const id = Number(request.params.id);

      if (id !== request.userId) {
        reply.code(403).send({ error: "You can only access your own account" });
        return;
      }

      const user = await userService.getbyId(id);
      if (!user) {
        reply.code(404).send({ error: "User not found" });
        return;
      }

      return user;
    }
  );

  app.put<{ Params: IdParams; Body: UserUpdateBody }>(
    "/:id",
    {
      schema: {
        params: idParamsSchema,
        body: userUpdateSchema,
        response: { 200: publicUserSchema },
      },
    },
    async (request, reply) => {
      const id = Number(request.params.id);

      if (id !== request.userId) {
        reply.code(403).send({ error: "You can only access your own account" });
        return;
      }

      return userService.update(id, trimStrings(request.body));
    }
  );

  app.delete<{ Params: IdParams }>(
    "/:id",
    { schema: { params: idParamsSchema, response: { 200: publicUserSchema } } },
    async (request, reply) => {
      const id = Number(request.params.id);

      if (id !== request.userId) {
        reply.code(403).send({ error: "You can only access your own account" });
        return;
      }

      return userService.remove(id);
    }
  );
};
