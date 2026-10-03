import api from './api'
import type { ApiResponse, Appointment, AppointmentStatus } from '../types'

export interface CreateAppointmentData {
  patientId: number
  fecha: string
  horaInicio: string
  horaFin: string
  estado?: AppointmentStatus
  motivo?: string
  observaciones?: string
}

export const appointmentsService = {
  async getAll(params?: { fecha?: string; estado?: string; patientId?: number }) {
    const response = await api.get<ApiResponse<Appointment[]>>('/api/appointments', { params })
    return response.data
  },
  async getToday() {
    const response = await api.get<ApiResponse<Appointment[]>>('/api/appointments/today')
    return response.data
  },
  async getWeek() {
    const response = await api.get<ApiResponse<Appointment[]>>('/api/appointments/week')
    return response.data
  },
  async getById(id: number) {
    const response = await api.get<ApiResponse<Appointment>>(`/api/appointments/${id}`)
    return response.data
  },
  async create(data: CreateAppointmentData) {
    const response = await api.post<ApiResponse<Appointment>>('/api/appointments', data)
    return response.data
  },
  async update(id: number, data: Partial<CreateAppointmentData>) {
    const response = await api.put<ApiResponse<Appointment>>(`/api/appointments/${id}`, data)
    return response.data
  },
  async changeStatus(id: number, estado: AppointmentStatus) {
    const response = await api.patch<ApiResponse<Appointment>>(`/api/appointments/${id}/status`, { estado })
    return response.data
  },
}
