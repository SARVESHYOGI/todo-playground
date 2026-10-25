import { db } from "../prisma/db.ts";
import { hashPassword, verifyPassword } from "../utils/password.ts";
import { createToken } from "../utils/token.ts";

const PUBLIC_FIELDS = ["id", "email", "username", "name", "createdAt", "updatedAt"] as const;

function omitPasswordHash<T extends { passwordHash?: unknown }>(row: T | null) {
  if (!row) return null;
  const { passwordHash: _passwordHash, ...rest } = row;
  return rest;
}

export const userService = {
  async list() {
    return await db.orm.public.User.select(...PUBLIC_FIELDS).all();
  },

  async getbyId(id: number) {
    return await db.orm.public.User.where({ id }).select(...PUBLIC_FIELDS).first();
  },

  async register(data: {
    email: string;
    username?: string | null;
    name?: string | null;
    password: string;
  }) {
    const existing = await db.orm.public.User.where({ email: data.email }).first();
    if (existing) return { conflict: true as const };

    const created = await db.orm.public.User.create({
      email: data.email,
      username: data.username ?? null,
      name: data.name ?? null,
      passwordHash: await hashPassword(data.password),
    });

    return {
      user: omitPasswordHash(created),
      token: createToken(created.id),
    };
  },

  async login(data: { email: string; password: string }) {
    const user = await db.orm.public.User.where({ email: data.email }).first();
    if (!user || !user.passwordHash) return null;

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) return null;

    return {
      user: omitPasswordHash(user),
      token: createToken(user.id),
    };
  },

  async update(id: number, data: { email?: string; username?: string | null; name?: string | null }) {
    const updated = await db.orm.public.User.where({ id }).update(data);
    return omitPasswordHash(updated);
  },

  async remove(id: number) {
    const deleted = await db.orm.public.User.where({ id }).delete();
    return omitPasswordHash(deleted);
  },
};
