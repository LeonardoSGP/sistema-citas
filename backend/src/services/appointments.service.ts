import prisma from '../config/database';

const OPENING_TIME = '08:00';
const CLOSING_TIME = '14:00';
const BUSINESS_TIME_ZONE = 'America/Mexico_City';

function getBusinessDateString(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function dateOnlyToUtc(dateString: string): Date {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function validateBusinessHours(horaInicio: string, horaFin: string) {
  if (horaInicio < OPENING_TIME) {
    throw new Error('Las citas deben iniciar a partir de las 08:00');
  }
  if (horaFin > CLOSING_TIME) {
    throw new Error('Las citas deben terminar a más tardar a las 14:00');
  }
  if (horaFin <= horaInicio) {
    throw new Error('La hora de fin debe ser posterior a la hora de inicio');
  }
}

export const appointmentsService = {
  async getAll(filters?: { fecha?: string; estado?: string; patientId?: number }) {
    const where: Record<string, unknown> = {};
    if (filters?.estado) where.estado = filters.estado;
    if (filters?.patientId) where.patientId = filters.patientId;
    if (filters?.fecha) {
      const date = dateOnlyToUtc(filters.fecha);
      const nextDay = addDays(date, 1);
      where.fecha = { gte: date, lt: nextDay };
    }
    return prisma.appointment.findMany({
      where,
      include: { patient: { select: { id: true, nombre: true, expediente: true } } },
      orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
    });
  },

  async getToday() {
    const today = dateOnlyToUtc(getBusinessDateString());
    const tomorrow = addDays(today, 1);
    return prisma.appointment.findMany({
      where: { fecha: { gte: today, lt: tomorrow } },
      include: { patient: { select: { id: true, nombre: true, expediente: true } } },
      orderBy: { horaInicio: 'asc' },
    });
  },

  async getWeek() {
    const today = dateOnlyToUtc(getBusinessDateString());
    const endOfWeek = addDays(today, 7);
    return prisma.appointment.findMany({
      where: { fecha: { gte: today, lt: endOfWeek } },
      include: { patient: { select: { id: true, nombre: true, expediente: true } } },
      orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
    });
  },

  async getMonth() {
    const [year, month] = getBusinessDateString().split('-').map(Number);
    const startOfMonth = dateOnlyToUtc(`${year}-${String(month).padStart(2, '0')}-01`);
    const endOfMonth = month === 12
      ? dateOnlyToUtc(`${year + 1}-01-01`)
      : dateOnlyToUtc(`${year}-${String(month + 1).padStart(2, '0')}-01`);
    return prisma.appointment.findMany({
      where: { fecha: { gte: startOfMonth, lt: endOfMonth } },
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

  async checkConflict(fecha: string, horaInicio: string, horaFin: string, excludeId?: number) {
    const dateObj = dateOnlyToUtc(fecha);
    const nextDay = addDays(dateObj, 1);
    const startTime = new Date(`1970-01-01T${horaInicio}:00.000Z`);
    const endTime = new Date(`1970-01-01T${horaFin}:00.000Z`);

    const where: Record<string, unknown> = {
      fecha: { gte: dateObj, lt: nextDay },
      OR: [
        {
          horaInicio: { lt: endTime },
          horaFin: { gt: startTime },
        },
      ],
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const conflict = await prisma.appointment.findFirst({ where });
    return conflict;
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
    validateBusinessHours(data.horaInicio, data.horaFin);

    // Validate not in the past
    if (data.fecha < getBusinessDateString()) {
      throw new Error('No se pueden agendar citas en fechas pasadas');
    }

    // Check for time conflicts
    const conflict = await this.checkConflict(data.fecha, data.horaInicio, data.horaFin);
    if (conflict) {
      throw new Error('Ya existe una cita programada en ese horario. Por favor seleccione otro horario.');
    }

    return prisma.appointment.create({
      data: {
        patientId: data.patientId,
        fecha: dateOnlyToUtc(data.fecha),
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
    // If date or time is being changed, validate
    if (data.fecha || data.horaInicio || data.horaFin) {
      const existing = await prisma.appointment.findUnique({ where: { id } });
      if (!existing) throw new Error('Cita no encontrada');

      const fecha = data.fecha || existing.fecha.toISOString().substring(0, 10);
      const horaInicio = data.horaInicio || existing.horaInicio.toISOString().substring(11, 16);
      const horaFin = data.horaFin || existing.horaFin.toISOString().substring(11, 16);
      validateBusinessHours(horaInicio, horaFin);

      // Validate not in the past (only when changing date)
      if (data.fecha) {
        if (data.fecha < getBusinessDateString()) {
          throw new Error('No se pueden re-programar citas a fechas pasadas');
        }
      }

      // Check for conflicts (excluding current appointment)
      const conflict = await this.checkConflict(fecha, horaInicio, horaFin, id);
      if (conflict) {
        throw new Error('Ya existe una cita programada en ese horario. Por favor seleccione otro horario.');
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.patientId !== undefined) updateData.patientId = data.patientId;
    if (data.fecha !== undefined) updateData.fecha = dateOnlyToUtc(data.fecha);
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

  async reschedule(id: number, data: { fecha: string; horaInicio: string; horaFin: string }) {
    validateBusinessHours(data.horaInicio, data.horaFin);

    // Validate not in the past
    if (data.fecha < getBusinessDateString()) {
      throw new Error('No se pueden re-programar citas a fechas pasadas');
    }

    // Check for conflicts
    const conflict = await this.checkConflict(data.fecha, data.horaInicio, data.horaFin, id);
    if (conflict) {
      throw new Error('Ya existe una cita programada en ese horario. Por favor seleccione otro horario.');
    }

    return prisma.appointment.update({
      where: { id },
      data: {
        fecha: dateOnlyToUtc(data.fecha),
        horaInicio: new Date(`1970-01-01T${data.horaInicio}:00.000Z`),
        horaFin: new Date(`1970-01-01T${data.horaFin}:00.000Z`),
        estado: 'Programada',
      },
      include: { patient: { select: { id: true, nombre: true, expediente: true } } },
    });
  },

  async changeStatus(id: number, estado: string) {
    const validStatuses = ['Programada', 'Atendida', 'No asistió'];
    if (!validStatuses.includes(estado)) {
      throw new Error('Estado inválido');
    }
    return prisma.appointment.update({ where: { id }, data: { estado } });
  },

  async getStats(period: 'week' | 'month', referenceDate?: string) {
    const selectedDateString = referenceDate || getBusinessDateString();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDateString)) throw new Error('Fecha de estadísticas inválida');
    const selectedDate = dateOnlyToUtc(selectedDateString);
    let start: Date;
    let end: Date;

    if (period === 'week') {
      const dayOfWeek = selectedDate.getUTCDay();
      start = new Date(selectedDate);
      start.setUTCDate(selectedDate.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      end = new Date(start);
      end.setUTCDate(start.getUTCDate() + 7);
    } else {
      start = dateOnlyToUtc(`${selectedDate.getUTCFullYear()}-${String(selectedDate.getUTCMonth() + 1).padStart(2, '0')}-01`);
      end = addDays(start, 32);
      end = dateOnlyToUtc(`${end.getUTCFullYear()}-${String(end.getUTCMonth() + 1).padStart(2, '0')}-01`);
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        fecha: { gte: start, lt: end },
        estado: 'Atendida',
      },
      include: { patient: { select: { id: true, nombre: true, sexo: true, edad: true } } },
    });

    // Count unique patients
    const patientMap = new Map<number, { sexo: string; edad: number }>();
    for (const appt of appointments) {
      if (appt.patient && !patientMap.has(appt.patient.id)) {
        patientMap.set(appt.patient.id, { sexo: appt.patient.sexo, edad: appt.patient.edad });
      }
    }

    let hombres = 0;
    let mujeres = 0;
    let otros = 0;
    const ageRanges = {
      '0-5': { total: 0, hombres: 0, mujeres: 0 },
      '6-11': { total: 0, hombres: 0, mujeres: 0 },
      '12-17': { total: 0, hombres: 0, mujeres: 0 },
      '18-59': { total: 0, hombres: 0, mujeres: 0 },
      '60+': { total: 0, hombres: 0, mujeres: 0 },
    };

    for (const [, patient] of patientMap) {
      if (patient.sexo === 'Masculino') hombres++;
      else if (patient.sexo === 'Femenino') mujeres++;
      else otros++;

      let range: keyof typeof ageRanges;
      if (patient.edad <= 5) range = '0-5';
      else if (patient.edad <= 11) range = '6-11';
      else if (patient.edad <= 17) range = '12-17';
      else if (patient.edad <= 59) range = '18-59';
      else range = '60+';

      ageRanges[range].total++;
      if (patient.sexo === 'Masculino') ageRanges[range].hombres++;
      else if (patient.sexo === 'Femenino') ageRanges[range].mujeres++;
    }

    return {
      period,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalAppointments: appointments.length,
      totalPatients: patientMap.size,
      gender: { hombres, mujeres, otros },
      ageRanges,
    };
  },
};
