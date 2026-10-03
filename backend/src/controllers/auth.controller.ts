import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result, 'Login exitoso');
    } catch (error) {
      sendError(res, (error as Error).message, 401);
    }
  },
  async profile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await authService.getProfile(req.userId!);
      sendSuccess(res, user);
    } catch (error) {
      sendError(res, (error as Error).message, 404);
    }
  },
  async logout(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, null, 'Sesión cerrada correctamente');
  },
};
