import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Delete existing data to avoid FK constraints
  await prisma.sessionNote.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  // Create user
  const hashedPassword = await bcrypt.hash('Demo1234!', 10);
  const user = await prisma.user.create({
    data: {
      nombre: 'Dra. Laura Mendoza',
      email: 'laura@psicologia.dev',
      password: hashedPassword,
    },
  });
  console.log('User created:', user.email);

  // Create patients
  const patientsData = [
    { expediente: 'EXP-001', nombre: 'Ana García López', edad: 28, sexo: 'Femenino' },
    { expediente: 'EXP-002', nombre: 'Carlos Martínez Ruiz', edad: 35, sexo: 'Masculino' },
    { expediente: 'EXP-003', nombre: 'María Torres Vega', edad: 22, sexo: 'Femenino' },
    { expediente: 'EXP-004', nombre: 'Roberto Sánchez Pérez', edad: 45, sexo: 'Masculino' },
    { expediente: 'EXP-005', nombre: 'Sofía Ramírez Luna', edad: 30, sexo: 'Femenino' },
  ];

  const patients = [];
  for (const p of patientsData) {
    const patient = await prisma.patient.create({ data: p });
    patients.push(patient);
  }
  console.log('Patients created:', patients.length);

  // Create appointments
  const appointmentsData = [
    { patientId: patients[0].id, fecha: new Date('2026-10-05'), horaInicio: new Date('1970-01-01T09:00:00.000Z'), horaFin: new Date('1970-01-01T10:00:00.000Z'), estado: 'Programada' },
    { patientId: patients[1].id, fecha: new Date('2026-10-06'), horaInicio: new Date('1970-01-01T10:30:00.000Z'), horaFin: new Date('1970-01-01T11:30:00.000Z'), estado: 'Confirmada' },
    { patientId: patients[2].id, fecha: new Date('2026-10-02'), horaInicio: new Date('1970-01-01T16:00:00.000Z'), horaFin: new Date('1970-01-01T17:00:00.000Z'), estado: 'Atendida' },
    { patientId: patients[3].id, fecha: new Date('2026-10-10'), horaInicio: new Date('1970-01-01T12:00:00.000Z'), horaFin: new Date('1970-01-01T13:00:00.000Z'), estado: 'Programada' },
    { patientId: patients[4].id, fecha: new Date('2026-10-15'), horaInicio: new Date('1970-01-01T09:00:00.000Z'), horaFin: new Date('1970-01-01T10:00:00.000Z'), estado: 'Programada' },
    { patientId: patients[0].id, fecha: new Date('2026-10-20'), horaInicio: new Date('1970-01-01T10:00:00.000Z'), horaFin: new Date('1970-01-01T11:00:00.000Z'), estado: 'Confirmada' },
    { patientId: patients[1].id, fecha: new Date('2026-10-01'), horaInicio: new Date('1970-01-01T11:00:00.000Z'), horaFin: new Date('1970-01-01T12:00:00.000Z'), estado: 'Atendida' },
    { patientId: patients[2].id, fecha: new Date('2026-11-05'), horaInicio: new Date('1970-01-01T15:00:00.000Z'), horaFin: new Date('1970-01-01T16:00:00.000Z'), estado: 'Programada' },
  ];

  const appointments = [];
  for (const a of appointmentsData) {
    const appt = await prisma.appointment.create({ data: a });
    appointments.push(appt);
  }
  console.log('Appointments created:', appointments.length);

  // Create session notes
  const attendedAppointments = appointments.filter((a) => a.estado === 'Atendida');
  for (const a of attendedAppointments) {
    await prisma.sessionNote.create({
      data: {
        patientId: a.patientId,
        appointmentId: a.id,
        fecha: a.fecha,
        motivo: 'Consulta de seguimiento',
        notas: 'El paciente reporta mejoría en su estado de ánimo.',
        observaciones: 'Continuar con el plan de tratamiento actual.',
        seguimiento: 'Cita en dos semanas',
      },
    });
  }
  console.log('Session notes created:', attendedAppointments.length);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
