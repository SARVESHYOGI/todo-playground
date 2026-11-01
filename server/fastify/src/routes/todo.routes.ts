import type { FastifyPluginAsync } from "fastify";
import { idParamsSchema, type IdParams } from "../schemas/common.schema.ts";
import {
  todoCreateSchema,
  todoListResponseSchema,
  todoResponseSchema,
  todoUpdateSchema,
  type TodoCreateBody,
  type TodoUpdateBody,
} from "../schemas/todo.schema.ts";
import { todoService } from "../services/todo.service.ts";
import { trimStrings } from "../utils/text.ts";

const EMPTY_TITLE = '"title" must be at least 1 characters';

const todoRoutes: FastifyPluginAsync = async (app) => {
  // Applies to every route in this plugin only — /users/register and
  // /users/login live in a different plugin and stay public.
  app.addHook("preHandler", app.authenticate);

  app.get(
    "/",
    { schema: { response: { 200: todoListResponseSchema } } },
    async (request) => todoService.list(request.userId)
  );

  app.get<{ Params: IdParams }>(
    "/:id",
    { schema: { params: idParamsSchema, response: { 200: todoResponseSchema } } },
    async (request, reply) => {
      const todo = await todoService.getbyId(Number(request.params.id), request.userId);
      if (!todo) {
        reply.code(404).send({ error: "Todo not found" });
        return;
      }
      return todo;
    }
  );

  app.post<{ Body: TodoCreateBody }>(
    "/",
    { schema: { body: todoCreateSchema, response: { 200: todoResponseSchema } } },
    async (request, reply) => {
      const body = trimStrings(request.body);

      if (body.title.length === 0) {
        reply.code(400).send({ errors: [EMPTY_TITLE] });
        return;
      }

      return todoService.create({ ...body, authorId: request.userId });
    }
  );

  app.put<{ Params: IdParams; Body: TodoUpdateBody }>(
    "/:id",
    {
      schema: {
        params: idParamsSchema,
        body: todoUpdateSchema,
        response: { 200: todoResponseSchema },
      },
    },
    async (request, reply) => {
      const body = trimStrings(request.body);

      if (body.title !== undefined && body.title.length === 0) {
        reply.code(400).send({ errors: [EMPTY_TITLE] });
        return;
      }

      const todo = await todoService.update(Number(request.params.id), request.userId, body);
      if (!todo) {
        reply.code(404).send({ error: "Todo not found" });
        return;
      }
      return todo;
    }
  );

  app.delete<{ Params: IdParams }>(
    "/:id",
    { schema: { params: idParamsSchema, response: { 200: todoResponseSchema } } },
    async (request, reply) => {
      const todo = await todoService.remove(Number(request.params.id), request.userId);
      if (!todo) {
        reply.code(404).send({ error: "Todo not found" });
        return;
      }
      return todo;
    }
  );
};

export default todoRoutes;
