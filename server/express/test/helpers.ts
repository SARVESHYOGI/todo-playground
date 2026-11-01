import request from 'supertest'
import app from '../src/app.ts'
import { db } from '../src/prisma/db.ts'

export const api = request(app)

let counter = 0

export function uniqueEmail(prefix = 'test'): string {
  counter += 1
  return `${prefix}_${Date.now()}_${counter}@example.com`
}

export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

export interface TestUser {
  id: number
  email: string
  password: string
  token: string
}

export async function registerUser(
  overrides: Partial<{ email: string; password: string; name: string }> = {},
): Promise<TestUser> {
  const email = overrides.email ?? uniqueEmail()
  const password = overrides.password ?? 'password123'
  const res = await api
    .post('/users/register')
    .send({ email, password, ...(overrides.name ? { name: overrides.name } : {}) })
    .expect(201)
  return { id: res.body.user.id, email, password, token: res.body.token }
}

/** Delete the given users (and their todos), then close the DB pool. */
export async function teardown(userIds: number[]): Promise<void> {
  for (const id of userIds) {
    await db.orm.public.Todo.where({ authorId: id }).deleteAndCount()
    await db.orm.public.User.where({ id }).deleteAndCount()
  }
  await db.close()
}
