import { z } from 'zod';

export const createPatientSchema = z.object({
  expediente: z
    .string()
    .length(4, 'El expediente debe tener exactamente 4 dígitos')
    .regex(/^\d{4}$/, 'El expediente debe contener solo números (4 dígitos)'),
  nombre: z.string().min(1, 'El nombre es obligatorio').max(255),
  telefono: z
    .string()
    .length(10, 'El teléfono debe tener exactamente 10 dígitos')
    .regex(/^\d{10}$/, 'El teléfono debe contener solo números (10 dígitos)'),
  edad: z.number().int().min(0, 'La edad debe ser mayor o igual a 0').max(150),
  sexo: z.enum(['Masculino', 'Femenino', 'Otro'], {
    errorMap: () => ({ message: 'El sexo debe ser Masculino, Femenino u Otro' }),
  }),
});

export const updatePatientSchema = z.object({
  expediente: z
    .string()
    .length(4, 'El expediente debe tener exactamente 4 dígitos')
    .regex(/^\d{4}$/, 'El expediente debe contener solo números (4 dígitos)')
    .optional(),
  nombre: z.string().min(1).max(255).optional(),
  telefono: z
    .string()
    .length(10, 'El teléfono debe tener exactamente 10 dígitos')
    .regex(/^\d{10}$/, 'El teléfono debe contener solo números (10 dígitos)')
    .optional(),
  edad: z.number().int().min(0).max(150).optional(),
  sexo: z.enum(['Masculino', 'Femenino', 'Otro']).optional(),
});
