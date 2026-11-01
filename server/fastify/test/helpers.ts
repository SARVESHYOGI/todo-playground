import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.ts";
import { db } from "../src/prisma/db.ts";

let counter = 0;

export function createApp(): FastifyInstance {
  return buildApp();
}

export function uniqueEmail(prefix = "test"): string {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}@example.com`;
}

export function authHeader(token: string): Record<string, string> {
  return { authorization: `Bearer ${token}` };
}

export interface TestUser {
  id: number;
  email: string;
  password: string;
  token: string;
}

export async function registerUser(
  app: FastifyInstance,
  overrides: Partial<{ email: string; password: string; name: string }> = {}
): Promise<TestUser> {
  const email = overrides.email ?? uniqueEmail();
  const password = overrides.password ?? "password123";

  const res = await app.inject({
    method: "POST",
    url: "/users/register",
    payload: { email, password, ...(overrides.name ? { name: overrides.name } : {}) },
  });

  if (res.statusCode !== 201) {
    throw new Error(`register failed: ${res.statusCode} ${res.body}`);
  }

  const body = res.json();
  return { id: body.user.id, email, password, token: body.token };
}

/** Delete the given users (and their todos), then close the app and DB pool. */
export async function teardown(app: FastifyInstance, userIds: number[]): Promise<void> {
  for (const id of userIds) {
    await db.orm.public.Todo.where({ authorId: id }).deleteAndCount();
    await db.orm.public.User.where({ id }).deleteAndCount();
  }

  await app.close();
  await db.close();
}
