import { Injectable } from "@nestjs/common";
import { db } from "../prisma/db";

@Injectable()
export class TodoService {
  async list(authorId: number) {
    return await db.orm.public.Todo.where({ authorId }).all();
  }

  async getbyId(id: number, authorId: number) {
    return await db.orm.public.Todo.where({ id, authorId }).first();
  }

  async create(data: { title: string; description?: string | null; authorId: number }) {
    return await db.orm.public.Todo.create({
      title: data.title,
      description: data.description,
      authorId: data.authorId,
    });
  }

  async update(
    id: number,
    authorId: number,
    data: { title?: string; description?: string | null; completed?: boolean }
  ) {
    return await db.orm.public.Todo.where({ id, authorId }).update(data);
  }

  async remove(id: number, authorId: number) {
    return await db.orm.public.Todo.where({ id, authorId }).delete();
  }
}
