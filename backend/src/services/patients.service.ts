import prisma from '../config/database';

export const patientsService = {
  buildWhere(filters?: { search?: string; sexo?: string; edadMin?: number; edadMax?: number; activo?: boolean }) {
    const where: Record<string, unknown> = {};
    if (filters?.sexo) where.sexo = filters.sexo;
    if (filters?.activo !== undefined) where.activo = filters.activo;
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
    return where;
  },

  async getAll(filters?: { search?: string; sexo?: string; edadMin?: number; edadMax?: number; activo?: boolean }) {
    return prisma.patient.findMany({
      where: this.buildWhere(filters),
      include: { _count: { select: { appointments: true } } },
      orderBy: { nombre: 'asc' },
    });
  },

  async getPaginated(
    filters: { search?: string; sexo?: string; edadMin?: number; edadMax?: number; activo?: boolean },
    page: number,
    limit: number
  ) {
    const where = this.buildWhere(filters);
    const [items, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: { _count: { select: { appointments: true } } },
        orderBy: { nombre: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.patient.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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

  async create(data: { expediente: string | null; nombre: string; telefono: string | null; edad: number; sexo: string }) {
    const expediente = data.expediente?.trim() || null;
    const telefono = data.telefono?.trim() || null;
    const existing = expediente
      ? await prisma.patient.findUnique({ where: { expediente } })
      : null;
    if (existing) throw new Error('Ya existe un paciente con ese número de expediente');
    return prisma.patient.create({ data: { ...data, expediente, telefono } });
  },

  async update(id: number, data: Partial<{ expediente: string | null; nombre: string; telefono: string | null; edad: number; sexo: string }>) {
    const normalizedData = {
      ...data,
      ...(data.expediente !== undefined ? { expediente: data.expediente?.trim() || null } : {}),
      ...(data.telefono !== undefined ? { telefono: data.telefono?.trim() || null } : {}),
    };
    if (normalizedData.expediente) {
      const existing = await prisma.patient.findFirst({
        where: { expediente: normalizedData.expediente, NOT: { id } },
      });
      if (existing) throw new Error('Ya existe un paciente con ese número de expediente');
    }
    return prisma.patient.update({ where: { id }, data: normalizedData });
  },

  async getCount() {
    return prisma.patient.count();
  },
};
