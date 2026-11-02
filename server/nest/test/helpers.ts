import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import { createApp } from "../src/app.factory";
import { db } from "../src/prisma/db";

export function makeApp(): Promise<INestApplication> {
  return createApp();
}

export function api(app: INestApplication) {
  return request(app.getHttpServer());
}

let counter = 0;

export function uniqueEmail(prefix = "test"): string {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}@example.com`;
}

export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export interface TestUser {
  id: number;
  email: string;
  password: string;
  token: string;
}

export async function registerUser(
  app: INestApplication,
  overrides: Partial<{ email: string; password: string; name: string }> = {}
): Promise<TestUser> {
  const email = overrides.email ?? uniqueEmail();
  const password = overrides.password ?? "password123";

  const res = await api(app)
    .post("/users/register")
    .send({ email, password, ...(overrides.name ? { name: overrides.name } : {}) });

  if (res.status !== 201) {
    throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  return { id: res.body.user.id, email, password, token: res.body.token };
}

/** Delete the given users (and their todos), then close the app and DB pool. */
export async function teardown(app: INestApplication, userIds: number[]): Promise<void> {
  for (const id of userIds) {
    await db.orm.public.Todo.where({ authorId: id }).deleteAndCount();
    await db.orm.public.User.where({ id }).deleteAndCount();
  }

  await app.close();
  await db.close();
}
