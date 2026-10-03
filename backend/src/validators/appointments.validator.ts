import { z } from 'zod';

export const createAppointmentSchema = z.object({
  patientId: z.number().int().positive('El paciente es obligatorio'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  horaInicio: z.string().min(1, 'La hora de inicio es obligatoria'),
  horaFin: z.string().min(1, 'La hora de fin es obligatoria'),
  estado: z
    .enum(['Programada', 'Atendida', 'Cancelada', 'No asistió'])
    .optional()
    .default('Programada'),
  motivo: z.string().optional(),
  observaciones: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  patientId: z.number().int().positive().optional(),
  fecha: z.string().optional(),
  horaInicio: z.string().optional(),
  horaFin: z.string().optional(),
  estado: z.enum(['Programada', 'Atendida', 'Cancelada', 'No asistió']).optional(),
  motivo: z.string().optional(),
  observaciones: z.string().optional(),
});
