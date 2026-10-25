import { Router } from "express";
import { userController } from '../controllers/user.controller.ts';
import { requireAuth } from '../middleware/auth.middleware.ts';
import { validateBody, validateIdParam } from '../middleware/validate.middleware.ts';
import { loginSchema, registerSchema, userUpdateSchema } from '../schemas/user.schema.ts';

const router = Router();

router.post('/register', validateBody(registerSchema), userController.register);
router.post('/login', validateBody(loginSchema), userController.login);

router.use(requireAuth);

router.get('/me', userController.me);
router.get('/', userController.list);
router.get('/:id', validateIdParam(), userController.getbyId);
router.put('/:id', validateIdParam(), validateBody(userUpdateSchema, { requireAtLeastOne: true }), userController.update);
router.delete('/:id', validateIdParam(), userController.remove);

export default router;
