import { Router } from "express";
import { userController } from '../controllers/user.controller.ts';

const router = Router();

router.get('/', userController.list);
router.get('/:id', userController.getbyId);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.remove);

export default router;
