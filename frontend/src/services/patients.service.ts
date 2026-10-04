import api from './api'
import type { ApiResponse, Patient } from '../types'

export interface CreatePatientData {
  expediente: string
  nombre: string
  telefono: string
  edad: number
  sexo: string
}

export interface PaginatedPatients {
  items: Patient[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const patientsService = {
  async getAll(params?: { search?: string; sexo?: string; edadMin?: number; edadMax?: number; activo?: boolean }) {
    const response = await api.get<ApiResponse<Patient[]>>('/api/patients', { params })
    return response.data
  },
  async getPaginated(params?: { search?: string; sexo?: string; edadMin?: number; edadMax?: number; page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<PaginatedPatients>>('/api/patients', { params })
    return response.data
  },
  async getById(id: number) {
    const response = await api.get<ApiResponse<Patient>>(`/api/patients/${id}`)
    return response.data
  },
  async getExpediente(id: number) {
    const response = await api.get<ApiResponse<Patient>>(`/api/patients/${id}/expediente`)
    return response.data
  },
  async create(data: CreatePatientData) {
    const response = await api.post<ApiResponse<Patient>>('/api/patients', data)
    return response.data
  },
  async update(id: number, data: Partial<CreatePatientData>) {
    const response = await api.put<ApiResponse<Patient>>(`/api/patients/${id}`, data)
    return response.data
  },
}
