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
  const hashedPassword = await bcrypt.hash('12345678', 10);
  const user = await prisma.user.create({
    data: {
      nombre: 'Lic. Jessica Ortiz',
      email: 'jessica@correo.com',
      password: hashedPassword,
    },
  });
  console.log('User created:', user.email);

  // Create patients
  const patientsData = [
    { expediente: '0001', nombre: 'Ana García López', telefono: '5512345678', edad: 28, sexo: 'Femenino' },
    { expediente: '0002', nombre: 'Carlos Martínez Ruiz', telefono: '5598765432', edad: 35, sexo: 'Masculino' },
    { expediente: '0003', nombre: 'María Torres Vega', telefono: '5511223344', edad: 22, sexo: 'Femenino' },
    { expediente: '0004', nombre: 'Roberto Sánchez Pérez', telefono: '5544332211', edad: 45, sexo: 'Masculino' },
    { expediente: '0005', nombre: 'Sofía Ramírez Luna', telefono: '5566778899', edad: 30, sexo: 'Femenino' },
    { expediente: '0006', nombre: 'Mateo Herrera', telefono: '5599887766', edad: 9, sexo: 'Masculino' },
    { expediente: '0007', nombre: 'Valentina Soto', telefono: '5500112233', edad: 16, sexo: 'Femenino' },
    { expediente: '0008', nombre: 'Javier Domínguez', telefono: '5533221100', edad: 65, sexo: 'Masculino' },
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
    { patientId: patients[1].id, fecha: new Date('2026-10-06'), horaInicio: new Date('1970-01-01T10:30:00.000Z'), horaFin: new Date('1970-01-01T11:30:00.000Z'), estado: 'Programada' },
    { patientId: patients[2].id, fecha: new Date('2026-10-02'), horaInicio: new Date('1970-01-01T16:00:00.000Z'), horaFin: new Date('1970-01-01T17:00:00.000Z'), estado: 'Atendida' },
    { patientId: patients[3].id, fecha: new Date('2026-10-10'), horaInicio: new Date('1970-01-01T12:00:00.000Z'), horaFin: new Date('1970-01-01T13:00:00.000Z'), estado: 'Programada' },
    { patientId: patients[4].id, fecha: new Date('2026-10-15'), horaInicio: new Date('1970-01-01T09:00:00.000Z'), horaFin: new Date('1970-01-01T10:00:00.000Z'), estado: 'Programada' },
    { patientId: patients[0].id, fecha: new Date('2026-10-20'), horaInicio: new Date('1970-01-01T10:00:00.000Z'), horaFin: new Date('1970-01-01T11:00:00.000Z'), estado: 'Programada' },
    { patientId: patients[1].id, fecha: new Date('2026-10-01'), horaInicio: new Date('1970-01-01T11:00:00.000Z'), horaFin: new Date('1970-01-01T12:00:00.000Z'), estado: 'Atendida' },
    { patientId: patients[2].id, fecha: new Date('2026-11-05'), horaInicio: new Date('1970-01-01T15:00:00.000Z'), horaFin: new Date('1970-01-01T16:00:00.000Z'), estado: 'Programada' },
    { patientId: patients[5].id, fecha: new Date('2026-10-03'), horaInicio: new Date('1970-01-01T10:00:00.000Z'), horaFin: new Date('1970-01-01T11:00:00.000Z'), estado: 'Atendida' },
    { patientId: patients[6].id, fecha: new Date('2026-10-04'), horaInicio: new Date('1970-01-01T16:00:00.000Z'), horaFin: new Date('1970-01-01T17:00:00.000Z'), estado: 'Atendida' },
    { patientId: patients[7].id, fecha: new Date('2026-10-04'), horaInicio: new Date('1970-01-01T17:30:00.000Z'), horaFin: new Date('1970-01-01T18:30:00.000Z'), estado: 'Atendida' },
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
