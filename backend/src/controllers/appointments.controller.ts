import { Response } from 'express';
import { appointmentsService } from '../services/appointments.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export const appointmentsController = {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { fecha, estado, patientId } = req.query;
      const appointments = await appointmentsService.getAll({
        fecha: fecha as string | undefined,
        estado: estado as string | undefined,
        patientId: patientId ? Number(patientId) : undefined,
      });
      sendSuccess(res, appointments);
    } catch (error) {
      sendError(res, (error as Error).message);
    }
  },
  async getToday(_req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await appointmentsService.getToday());
    } catch (error) {
      sendError(res, (error as Error).message);
    }
  },
  async getWeek(_req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await appointmentsService.getWeek());
    } catch (error) {
      sendError(res, (error as Error).message);
    }
  },
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await appointmentsService.getById(Number(req.params.id)));
    } catch (error) {
      sendError(res, (error as Error).message, 404);
    }
  },
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const appointment = await appointmentsService.create(req.body);
      sendSuccess(res, appointment, 'Cita registrada correctamente', 201);
    } catch (error) {
      const msg = (error as Error).message;
      sendError(res, msg, msg.includes('horario') ? 409 : 500);
    }
  },
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await appointmentsService.update(Number(req.params.id), req.body), 'Cita actualizada');
    } catch (error) {
      sendError(res, (error as Error).message);
    }
  },
  async changeStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { estado } = req.body;
      sendSuccess(res, await appointmentsService.changeStatus(Number(req.params.id), estado), 'Estado actualizado');
    } catch (error) {
      sendError(res, (error as Error).message);
    }
  },
};
