import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { changePasswordSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator';

const router = Router();
router.post('/login', validate(loginSchema), authController.login);
router.get('/profile', authMiddleware, authController.profile);
router.post('/logout', authMiddleware, authController.logout);
router.put('/profile', authMiddleware, validate(updateProfileSchema), authController.updateProfile);
router.put('/password', authMiddleware, validate(changePasswordSchema), authController.changePassword);
export default router;
