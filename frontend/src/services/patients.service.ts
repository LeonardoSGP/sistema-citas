import api from './api'
import type { ApiResponse, Patient } from '../types'

export interface CreatePatientData {
  expediente: string
  nombre: string
  edad: number
  sexo: string
}

export const patientsService = {
  async getAll(params?: { search?: string; activo?: boolean }) {
    const response = await api.get<ApiResponse<Patient[]>>('/api/patients', { params })
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
  async deactivate(id: number) {
    const response = await api.patch<ApiResponse<Patient>>(`/api/patients/${id}/deactivate`)
    return response.data
  },
  async activate(id: number) {
    const response = await api.patch<ApiResponse<Patient>>(`/api/patients/${id}/activate`)
    return response.data
  },
}
