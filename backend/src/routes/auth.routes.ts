import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { loginSchema } from '../validators/auth.validator';

const router = Router();
router.post('/login', validate(loginSchema), authController.login);
router.get('/profile', authMiddleware, authController.profile);
router.post('/logout', authMiddleware, authController.logout);
export default router;
