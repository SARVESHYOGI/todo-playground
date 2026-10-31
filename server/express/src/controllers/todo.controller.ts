import type { Request, Response } from 'express';
import { todoService } from '../services/todo.service.ts';

export const todoController = {
  async list(req: Request, res: Response) {
    const result = await todoService.list(req.userId!);
    res.json(result);
  },

  async getbyId(req: Request, res: Response) {
    const result = await todoService.getbyId(Number(req.params.id), req.userId!);
    if (!result) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    res.json(result);
  },

  async create(req: Request, res: Response) {
    const result = await todoService.create({ ...req.body, authorId: req.userId! });
    res.json(result);
  },

  async update(req: Request, res: Response) {
    const result = await todoService.update(Number(req.params.id), req.userId!, req.body);
    if (!result) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    res.json(result);
  },

  async remove(req: Request, res: Response) {
    const result = await todoService.remove(Number(req.params.id), req.userId!);
    if (!result) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    res.json(result);
  },
}
