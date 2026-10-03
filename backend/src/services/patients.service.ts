import prisma from '../config/database';

export const patientsService = {
  async getAll(filters?: { search?: string; sexo?: string; edadMin?: number; edadMax?: number }) {
    const where: Record<string, unknown> = {};
    if (filters?.sexo) where.sexo = filters.sexo;
    if (filters?.edadMin !== undefined || filters?.edadMax !== undefined) {
      where.edad = {};
      if (filters?.edadMin !== undefined) (where.edad as Record<string, unknown>).gte = filters.edadMin;
      if (filters?.edadMax !== undefined) (where.edad as Record<string, unknown>).lte = filters.edadMax;
    }
    if (filters?.search) {
      where.OR = [
        { nombre: { contains: filters.search } },
        { expediente: { contains: filters.search } },
        { telefono: { contains: filters.search } },
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

  async create(data: { expediente: string; nombre: string; telefono: string; edad: number; sexo: string }) {
    const existing = await prisma.patient.findUnique({ where: { expediente: data.expediente } });
    if (existing) throw new Error('Ya existe un paciente con ese número de expediente');
    return prisma.patient.create({ data });
  },

  async update(id: number, data: Partial<{ expediente: string; nombre: string; telefono: string; edad: number; sexo: string }>) {
    if (data.expediente) {
      const existing = await prisma.patient.findFirst({
        where: { expediente: data.expediente, NOT: { id } },
      });
      if (existing) throw new Error('Ya existe un paciente con ese número de expediente');
    }
    return prisma.patient.update({ where: { id }, data });
  },

  async getCount() {
    return prisma.patient.count();
  },
};
