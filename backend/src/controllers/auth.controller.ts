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
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await authService.updateProfile(req.userId!, req.body), 'Perfil actualizado correctamente');
    } catch (error) {
      const message = (error as Error).message;
      sendError(res, message, message.includes('correo') ? 409 : 500);
    }
  },
  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      await authService.changePassword(req.userId!, req.body.currentPassword, req.body.newPassword);
      sendSuccess(res, null, 'Contraseña actualizada correctamente');
    } catch (error) {
      const message = (error as Error).message;
      sendError(res, message, message.includes('incorrecta') ? 400 : 500);
    }
  },
};
