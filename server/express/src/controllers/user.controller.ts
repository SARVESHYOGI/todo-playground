import type { Request, Response } from 'express';
import { userService } from '../services/user.service.ts';

export const userController = {
  async register(req: Request, res: Response) {
    const result = await userService.register(req.body);
    if ("conflict" in result) {
      res.status(409).json({ error: "Email is already registered" });
      return;
    }
    res.status(201).json(result);
  },

  async login(req: Request, res: Response) {
    const result = await userService.login(req.body);
    if (!result) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    res.json(result);
  },

  async me(req: Request, res: Response) {
    const result = await userService.getbyId(req.userId!);
    res.json(result);
  },

  async list(_req: Request, res: Response) {
    res.json(await userService.list());
  },

  async getbyId(req: Request, res: Response) {
    const result = await userService.getbyId(Number(req.params.id));
    res.json(result);
  },

  async update(req: Request, res: Response) {
    const result = await userService.update(Number(req.params.id), req.body);
    res.json(result);
  },

  async remove(req: Request, res: Response) {
    const result = await userService.remove(Number(req.params.id));
    res.json(result);
  },
}
