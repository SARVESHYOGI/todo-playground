import { db } from "../prisma/db"

export const userService = {
  async list() {
    return await db.orm.public.User.all()
  },

  async getbyId(id: number) {
    return await db.orm.public.User.where({ id }).first()
  },

  async create(data: { email: string; username?: string; name?: string }) {
    return await db.orm.public.User.create({
      email: data.email,
      username: data.username,
      name: data.name,
    })
  },

  async update(id: number, data: { email?: string; username?: string; name?: string }) {
    return await db.orm.public.User.where({ id }).update(data)
  },

  async remove(id: number) {
    return await db.orm.public.User.where({ id }).delete()
  }
}
