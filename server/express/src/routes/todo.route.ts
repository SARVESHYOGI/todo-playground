import { Router } from "express";
import { todoController } from '../controllers/todo.controller.ts';

const router = Router();

router.get('/', todoController.list);
router.get('/:id', todoController.getbyId);
router.post('/', todoController.create);
router.put('/:id', todoController.update);
router.delete('/:id', todoController.remove);

export default router;
