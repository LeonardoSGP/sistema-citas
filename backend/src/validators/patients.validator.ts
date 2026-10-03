import { z } from 'zod';

export const createPatientSchema = z.object({
  expediente: z.string().min(1, 'El número de expediente es obligatorio').max(50),
  nombre: z.string().min(1, 'El nombre es obligatorio').max(255),
  edad: z.number().int().min(0, 'La edad debe ser mayor o igual a 0').max(150),
  sexo: z.enum(['Masculino', 'Femenino', 'Otro'], {
    errorMap: () => ({ message: 'El sexo debe ser Masculino, Femenino u Otro' }),
  }),
});

export const updatePatientSchema = z.object({
  expediente: z.string().min(1).max(50).optional(),
  nombre: z.string().min(1).max(255).optional(),
  edad: z.number().int().min(0).max(150).optional(),
  sexo: z.enum(['Masculino', 'Femenino', 'Otro']).optional(),
  activo: z.boolean().optional(),
});
