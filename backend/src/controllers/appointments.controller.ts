import { Response } from 'express';
import { Prisma } from '@prisma/client';
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
  async getMonth(_req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await appointmentsService.getMonth());
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
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        sendError(res, 'Ya existe una cita en esa fecha y hora de inicio.', 409);
        return;
      }
      const msg = (error as Error).message;
      const status = msg.includes('horario') || msg.includes('existe') ? 409 : msg.includes('pasadas') || msg.includes('08:00') || msg.includes('14:00') || msg.includes('horas completas') ? 400 : 500;
      sendError(res, msg, status);
    }
  },
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await appointmentsService.update(Number(req.params.id), req.body), 'Cita actualizada');
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        sendError(res, 'Ya existe una cita en esa fecha y hora de inicio.', 409);
        return;
      }
      const msg = (error as Error).message;
      const status = msg.includes('horario') || msg.includes('existe') ? 409 : msg.includes('pasadas') || msg.includes('08:00') || msg.includes('14:00') || msg.includes('horas completas') ? 400 : 500;
      sendError(res, msg, status);
    }
  },
  async reschedule(req: AuthRequest, res: Response): Promise<void> {
    try {
      const appointment = await appointmentsService.reschedule(Number(req.params.id), req.body);
      sendSuccess(res, appointment, 'Cita re-programada correctamente');
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        sendError(res, 'Ya existe una cita en esa fecha y hora de inicio.', 409);
        return;
      }
      const msg = (error as Error).message;
      const status = msg.includes('horario') || msg.includes('existe') ? 409 : msg.includes('pasadas') || msg.includes('08:00') || msg.includes('14:00') || msg.includes('horas completas') ? 400 : 500;
      sendError(res, msg, status);
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
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const period = (req.query.period as string) || 'week';
      const referenceDate = req.query.referenceDate as string | undefined;
      if (period !== 'week' && period !== 'month') {
        sendError(res, 'El período debe ser "week" o "month"', 400);
        return;
      }
      const stats = await appointmentsService.getStats(period, referenceDate);
      sendSuccess(res, stats);
    } catch (error) {
      sendError(res, (error as Error).message);
    }
  },
};
