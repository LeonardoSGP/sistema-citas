import prisma from '../config/database';

export const sessionNotesService = {
  async getAll(patientId?: number) {
    return prisma.sessionNote.findMany({
      where: patientId ? { patientId } : {},
      include: {
        patient: { select: { id: true, nombre: true, expediente: true } },
        appointment: { select: { id: true, fecha: true, horaInicio: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  },

  async getById(id: number) {
    const note = await prisma.sessionNote.findUnique({
      where: { id },
      include: { patient: true, appointment: true },
    });
    if (!note) throw new Error('Nota no encontrada');
    return note;
  },

  async create(data: {
    patientId: number;
    appointmentId?: number | null;
    fecha: string;
    motivo?: string;
    notas?: string;
    observaciones?: string;
    seguimiento?: string;
  }) {
    return prisma.sessionNote.create({
      data: {
        patientId: data.patientId,
        appointmentId: data.appointmentId || null,
        fecha: new Date(data.fecha),
        motivo: data.motivo,
        notas: data.notas,
        observaciones: data.observaciones,
        seguimiento: data.seguimiento,
      },
      include: {
        patient: { select: { id: true, nombre: true, expediente: true } },
        appointment: { select: { id: true, fecha: true } },
      },
    });
  },

  async update(id: number, data: Partial<{
    fecha: string;
    motivo: string;
    notas: string;
    observaciones: string;
    seguimiento: string;
  }>) {
    const updateData: Record<string, unknown> = {};
    if (data.fecha) updateData.fecha = new Date(data.fecha);
    if (data.motivo !== undefined) updateData.motivo = data.motivo;
    if (data.notas !== undefined) updateData.notas = data.notas;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;
    if (data.seguimiento !== undefined) updateData.seguimiento = data.seguimiento;
    return prisma.sessionNote.update({
      where: { id },
      data: updateData,
      include: {
        patient: { select: { id: true, nombre: true, expediente: true } },
        appointment: { select: { id: true, fecha: true } },
      },
    });
  },
};
