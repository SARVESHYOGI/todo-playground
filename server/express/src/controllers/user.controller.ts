import type { Request, Response } from 'express';
import { userService } from '../services/user.service.ts';

export const userController = {
  async list(_req: Request, res: Response) {
    const result = await userService.list();
    res.json(result);
  },

  async getbyId(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await userService.getbyId(id);
    res.json(result);
  },

  async create(req: Request, res: Response) {
    const result = await userService.create(req.body);
    res.json(result);
  },

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await userService.update(id, req.body);
    res.json(result);
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await userService.remove(id);
    res.json(result);
  },
}
