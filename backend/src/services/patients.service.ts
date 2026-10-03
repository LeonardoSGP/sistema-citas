import prisma from '../config/database';

export const patientsService = {
  async getAll(search?: string, activo?: boolean) {
    const where: Record<string, unknown> = {};
    if (activo !== undefined) where.activo = activo;
    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { expediente: { contains: search } },
      ];
    }
    return prisma.patient.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });
  },

  async getById(id: number) {
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new Error('Paciente no encontrado');
    return patient;
  },

  async getExpediente(id: number) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: { orderBy: { fecha: 'desc' } },
        sessionNotes: { orderBy: { fecha: 'desc' } },
      },
    });
    if (!patient) throw new Error('Paciente no encontrado');
    return patient;
  },

  async create(data: { expediente: string; nombre: string; edad: number; sexo: string }) {
    const existing = await prisma.patient.findUnique({ where: { expediente: data.expediente } });
    if (existing) throw new Error('Ya existe un paciente con ese número de expediente');
    return prisma.patient.create({ data });
  },

  async update(id: number, data: Partial<{ expediente: string; nombre: string; edad: number; sexo: string; activo: boolean }>) {
    if (data.expediente) {
      const existing = await prisma.patient.findFirst({
        where: { expediente: data.expediente, NOT: { id } },
      });
      if (existing) throw new Error('Ya existe un paciente con ese número de expediente');
    }
    return prisma.patient.update({ where: { id }, data });
  },

  async deactivate(id: number) {
    return prisma.patient.update({ where: { id }, data: { activo: false } });
  },

  async activate(id: number) {
    return prisma.patient.update({ where: { id }, data: { activo: true } });
  },
};
