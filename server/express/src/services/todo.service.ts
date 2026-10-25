import { db } from "../prisma/db.ts"

export const todoService = {
  async list() {
    return await db.orm.public.Todo.all()
  },

  async getbyId(id: number) {
    return await db.orm.public.Todo.where({ id }).first()
  },

  async create(data: { title: string; description?: string; authorId: number }) {
    return await db.orm.public.Todo.create({
      title: data.title,
      description: data.description,
      authorId: data.authorId,
    })
  },

  async update(id: number, data: { title?: string; description?: string; completed?: boolean }) {
    return await db.orm.public.Todo.where({ id }).update(data)
  },

  async remove(id: number) {
    return await db.orm.public.Todo.where({ id }).delete()
  }
}
