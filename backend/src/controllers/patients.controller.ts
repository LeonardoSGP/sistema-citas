import { Response } from 'express';
import { patientsService } from '../services/patients.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export const patientsController = {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { search, activo } = req.query;
      const activoFilter = activo === 'true' ? true : activo === 'false' ? false : undefined;
      const patients = await patientsService.getAll(search as string | undefined, activoFilter);
      sendSuccess(res, patients);
    } catch (error) {
      sendError(res, (error as Error).message);
    }
  },
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const patient = await patientsService.getById(Number(req.params.id));
      sendSuccess(res, patient);
    } catch (error) {
      sendError(res, (error as Error).message, 404);
    }
  },
  async getExpediente(req: AuthRequest, res: Response): Promise<void> {
    try {
      const patient = await patientsService.getExpediente(Number(req.params.id));
      sendSuccess(res, patient);
    } catch (error) {
      sendError(res, (error as Error).message, 404);
    }
  },
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const patient = await patientsService.create(req.body);
      sendSuccess(res, patient, 'Paciente registrado correctamente', 201);
    } catch (error) {
      const msg = (error as Error).message;
      sendError(res, msg, msg.includes('expediente') ? 409 : 500);
    }
  },
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const patient = await patientsService.update(Number(req.params.id), req.body);
      sendSuccess(res, patient, 'Paciente actualizado correctamente');
    } catch (error) {
      const msg = (error as Error).message;
      sendError(res, msg, msg.includes('expediente') ? 409 : 500);
    }
  },
  async deactivate(req: AuthRequest, res: Response): Promise<void> {
    try {
      await patientsService.deactivate(Number(req.params.id));
      sendSuccess(res, null, 'Paciente desactivado');
    } catch (error) {
      sendError(res, (error as Error).message);
    }
  },
  async activate(req: AuthRequest, res: Response): Promise<void> {
    try {
      await patientsService.activate(Number(req.params.id));
      sendSuccess(res, null, 'Paciente activado');
    } catch (error) {
      sendError(res, (error as Error).message);
    }
  },
};
