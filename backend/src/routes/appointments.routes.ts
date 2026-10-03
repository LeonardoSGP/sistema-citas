import { Router } from 'express';
import { appointmentsController } from '../controllers/appointments.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createAppointmentSchema, updateAppointmentSchema } from '../validators/appointments.validator';

const router = Router();
router.use(authMiddleware);
router.get('/', appointmentsController.getAll);
router.get('/today', appointmentsController.getToday);
router.get('/week', appointmentsController.getWeek);
router.get('/month', appointmentsController.getMonth);
router.get('/stats', appointmentsController.getStats);
router.get('/:id', appointmentsController.getById);
router.post('/', validate(createAppointmentSchema), appointmentsController.create);
router.put('/:id', validate(updateAppointmentSchema), appointmentsController.update);
router.patch('/:id/reschedule', appointmentsController.reschedule);
router.patch('/:id/status', appointmentsController.changeStatus);
export default router;
