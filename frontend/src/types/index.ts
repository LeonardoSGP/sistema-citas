export interface User {
  id: number
  nombre: string
  email: string
}

export interface Patient {
  id: number
  expediente: string | null
  nombre: string
  telefono: string | null
  edad: number
  sexo: string
  activo: boolean
  createdAt: string
  updatedAt: string
  appointments?: Appointment[]
  sessionNotes?: SessionNote[]
  _count?: { appointments: number }
}

export interface Appointment {
  id: number
  patientId: number
  patient?: Pick<Patient, 'id' | 'nombre' | 'expediente'>
  fecha: string
  horaInicio: string
  horaFin: string
  estado: AppointmentStatus
  motivo?: string
  observaciones?: string
  sessionNotes?: SessionNote[]
  createdAt: string
  updatedAt: string
}

export type AppointmentStatus = 'Programada' | 'Atendida' | 'No asistió'

export interface SessionNote {
  id: number
  patientId: number
  patient?: Pick<Patient, 'id' | 'nombre' | 'expediente'>
  appointmentId?: number | null
  appointment?: Pick<Appointment, 'id' | 'fecha' | 'horaInicio'> | null
  fecha: string
  motivo?: string
  notas?: string
  observaciones?: string
  seguimiento?: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: Array<{ field: string; message: string }>
}

export interface PatientStats {
  period: string
  startDate: string
  endDate: string
  totalAppointments: number
  totalPatients: number
  gender: {
    hombres: number
    mujeres: number
    otros: number
  }
  ageRanges: {
    '0-5': { total: number; hombres: number; mujeres: number }
    '6-11': { total: number; hombres: number; mujeres: number }
    '12-17': { total: number; hombres: number; mujeres: number }
    '18-59': { total: number; hombres: number; mujeres: number }
    '60+': { total: number; hombres: number; mujeres: number }
  }
}
