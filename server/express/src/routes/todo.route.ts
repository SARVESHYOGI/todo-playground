import { Router } from "express";
import { todoController } from '../controllers/todo.controller.ts';
import { requireAuth } from '../middleware/auth.middleware.ts';
import { validateBody, validateIdParam } from '../middleware/validate.middleware.ts';
import { todoCreateSchema, todoUpdateSchema } from '../schemas/todo.schema.ts';

const router = Router();

router.use(requireAuth);

router.get('/', todoController.list);
router.get('/:id', validateIdParam(), todoController.getbyId);
router.post('/', validateBody(todoCreateSchema), todoController.create);
router.put('/:id', validateIdParam(), validateBody(todoUpdateSchema, { requireAtLeastOne: true }), todoController.update);
router.delete('/:id', validateIdParam(), todoController.remove);

export default router;
