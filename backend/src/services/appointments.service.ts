import prisma from '../config/database';

export const appointmentsService = {
  async getAll(filters?: { fecha?: string; estado?: string; patientId?: number }) {
    const where: Record<string, unknown> = {};
    if (filters?.estado) where.estado = filters.estado;
    if (filters?.patientId) where.patientId = filters.patientId;
    if (filters?.fecha) {
      const date = new Date(filters.fecha);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      where.fecha = { gte: date, lt: nextDay };
    }
    return prisma.appointment.findMany({
      where,
      include: { patient: { select: { id: true, nombre: true, expediente: true } } },
      orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
    });
  },

  async getToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return prisma.appointment.findMany({
      where: { fecha: { gte: today, lt: tomorrow } },
      include: { patient: { select: { id: true, nombre: true, expediente: true } } },
      orderBy: { horaInicio: 'asc' },
    });
  },

  async getWeek() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);
    return prisma.appointment.findMany({
      where: { fecha: { gte: today, lt: endOfWeek } },
      include: { patient: { select: { id: true, nombre: true, expediente: true } } },
      orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
    });
  },

  async getById(id: number) {
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, sessionNotes: true },
    });
    if (!appt) throw new Error('Cita no encontrada');
    return appt;
  },

  async create(data: {
    patientId: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    estado?: string;
    motivo?: string;
    observaciones?: string;
  }) {
    return prisma.appointment.create({
      data: {
        patientId: data.patientId,
        fecha: new Date(data.fecha),
        horaInicio: new Date(`1970-01-01T${data.horaInicio}:00.000Z`),
        horaFin: new Date(`1970-01-01T${data.horaFin}:00.000Z`),
        estado: data.estado || 'Programada',
        motivo: data.motivo,
        observaciones: data.observaciones,
      },
      include: { patient: { select: { id: true, nombre: true, expediente: true } } },
    });
  },

  async update(id: number, data: Partial<{
    patientId: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    estado: string;
    motivo: string;
    observaciones: string;
  }>) {
    const updateData: Record<string, unknown> = {};
    if (data.patientId !== undefined) updateData.patientId = data.patientId;
    if (data.fecha !== undefined) updateData.fecha = new Date(data.fecha);
    if (data.horaInicio !== undefined) updateData.horaInicio = new Date(`1970-01-01T${data.horaInicio}:00.000Z`);
    if (data.horaFin !== undefined) updateData.horaFin = new Date(`1970-01-01T${data.horaFin}:00.000Z`);
    if (data.estado !== undefined) updateData.estado = data.estado;
    if (data.motivo !== undefined) updateData.motivo = data.motivo;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;
    return prisma.appointment.update({
      where: { id },
      data: updateData,
      include: { patient: { select: { id: true, nombre: true, expediente: true } } },
    });
  },

  async changeStatus(id: number, estado: string) {
    return prisma.appointment.update({ where: { id }, data: { estado } });
  },
};
