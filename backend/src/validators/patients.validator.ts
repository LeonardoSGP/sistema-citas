import { z } from 'zod';

export const createPatientSchema = z.object({
  expediente: z
    .string()
    .trim()
    .refine((value) => !value || /^\d{3,4}$/.test(value), 'El expediente debe contener 3 o 4 dígitos si se proporciona')
    .transform((value) => value || null),
  nombre: z.string().min(1, 'El nombre es obligatorio').max(255),
  telefono: z
    .string()
    .trim()
    .refine((value) => !value || /^\d{10}$/.test(value), 'El teléfono debe contener 10 dígitos si se proporciona')
    .transform((value) => value || null),
  edad: z.number().int().min(0, 'La edad debe ser mayor o igual a 0').max(150),
  sexo: z.enum(['Masculino', 'Femenino', 'Otro'], {
    errorMap: () => ({ message: 'El sexo debe ser Masculino, Femenino u Otro' }),
  }),
});

export const updatePatientSchema = z.object({
  expediente: z
    .string()
    .trim()
    .refine((value) => !value || /^\d{3,4}$/.test(value), 'El expediente debe contener 3 o 4 dígitos si se proporciona')
    .transform((value) => value || null)
    .optional(),
  nombre: z.string().min(1).max(255).optional(),
  telefono: z
    .string()
    .trim()
    .refine((value) => !value || /^\d{10}$/.test(value), 'El teléfono debe contener 10 dígitos si se proporciona')
    .transform((value) => value || null)
    .optional(),
  edad: z.number().int().min(0).max(150).optional(),
  sexo: z.enum(['Masculino', 'Femenino', 'Otro']).optional(),
});
