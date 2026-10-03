import { z } from 'zod';

export const createSessionNoteSchema = z.object({
  patientId: z.number().int().positive('El paciente es obligatorio'),
  appointmentId: z.number().int().positive().optional().nullable(),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  motivo: z.string().optional(),
  notas: z.string().optional(),
  observaciones: z.string().optional(),
  seguimiento: z.string().optional(),
});

export const updateSessionNoteSchema = z.object({
  fecha: z.string().optional(),
  motivo: z.string().optional(),
  notas: z.string().optional(),
  observaciones: z.string().optional(),
  seguimiento: z.string().optional(),
});
