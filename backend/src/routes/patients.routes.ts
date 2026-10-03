import { Router } from 'express';
import { patientsController } from '../controllers/patients.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createPatientSchema, updatePatientSchema } from '../validators/patients.validator';

const router = Router();
router.use(authMiddleware);
router.get('/', patientsController.getAll);
router.get('/:id', patientsController.getById);
router.get('/:id/expediente', patientsController.getExpediente);
router.post('/', validate(createPatientSchema), patientsController.create);
router.put('/:id', validate(updatePatientSchema), patientsController.update);
export default router;
