export interface User {
  id: number
  nombre: string
  email: string
}

export interface Patient {
  id: number
  expediente: string
  nombre: string
  edad: number
  sexo: string
  activo: boolean
  createdAt: string
  updatedAt: string
  appointments?: Appointment[]
  sessionNotes?: SessionNote[]
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

export type AppointmentStatus = 'Programada' | 'Confirmada' | 'Atendida' | 'Cancelada' | 'No asistió'

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
