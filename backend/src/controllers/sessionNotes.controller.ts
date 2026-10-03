import { Response } from 'express';
import { sessionNotesService } from '../services/sessionNotes.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export const sessionNotesController = {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { patientId } = req.query;
      sendSuccess(res, await sessionNotesService.getAll(patientId ? Number(patientId) : undefined));
    } catch (error) {
      sendError(res, (error as Error).message);
    }
  },
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await sessionNotesService.getById(Number(req.params.id)));
    } catch (error) {
      sendError(res, (error as Error).message, 404);
    }
  },
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await sessionNotesService.create(req.body), 'Nota creada correctamente', 201);
    } catch (error) {
      sendError(res, (error as Error).message);
    }
  },
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await sessionNotesService.update(Number(req.params.id), req.body), 'Nota actualizada');
    } catch (error) {
      sendError(res, (error as Error).message);
    }
  },
};
