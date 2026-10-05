import api from './api'
import type { ApiResponse, Appointment, AppointmentStatus, PatientStats } from '../types'

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
    const response = await api.get<ApiResponse<Appointment[]>>('/api/appointments', {
      params: { ...params, _refresh: Date.now() },
    })
    return response.data
  },
  async getToday() {
    const response = await api.get<ApiResponse<Appointment[]>>('/api/appointments/today', {
      params: { _refresh: Date.now() },
    })
    return response.data
  },
  async getWeek() {
    const response = await api.get<ApiResponse<Appointment[]>>('/api/appointments/week', {
      params: { _refresh: Date.now() },
    })
    return response.data
  },
  async getMonth() {
    const response = await api.get<ApiResponse<Appointment[]>>('/api/appointments/month')
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
  async reschedule(id: number, data: { fecha: string; horaInicio: string; horaFin: string }) {
    const response = await api.patch<ApiResponse<Appointment>>(`/api/appointments/${id}/reschedule`, data)
    return response.data
  },
  async changeStatus(id: number, estado: AppointmentStatus) {
    const response = await api.patch<ApiResponse<Appointment>>(`/api/appointments/${id}/status`, { estado })
    return response.data
  },
  async getStats(period: 'week' | 'month', referenceDate?: string) {
    const response = await api.get<ApiResponse<PatientStats>>('/api/appointments/stats', { params: { period, referenceDate } })
    return response.data
  },
}
