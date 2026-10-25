import type { Request, Response } from 'express';
import { todoService } from '../services/todo.service.ts';

export const todoController = {
  async list(_req: Request, res: Response) {
    const result = await todoService.list();
    res.json(result);
  },

  async getbyId(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await todoService.getbyId(id);
    res.json(result);
  },

  async create(req: Request, res: Response) {
    const result = await todoService.create(req.body);
    res.json(result);
  },

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await todoService.update(id, req.body);
    res.json(result);
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await todoService.remove(id);
    res.json(result);
  },
}
