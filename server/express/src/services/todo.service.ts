import { db } from "../prisma/db.ts"

export const todoService = {
  async list(authorId: number) {
    return await db.orm.public.Todo.where({ authorId }).all()
  },

  async getbyId(id: number, authorId: number) {
    return await db.orm.public.Todo.where({ id, authorId }).first()
  },

  async create(data: { title: string; description?: string; authorId: number }) {
    return await db.orm.public.Todo.create({
      title: data.title,
      description: data.description,
      authorId: data.authorId,
    })
  },

  async update(id: number, authorId: number, data: { title?: string; description?: string; completed?: boolean }) {
    return await db.orm.public.Todo.where({ id, authorId }).update(data)
  },

  async remove(id: number, authorId: number) {
    return await db.orm.public.Todo.where({ id, authorId }).delete()
  }
}
