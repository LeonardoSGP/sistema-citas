import api from './api'
import type { ApiResponse, SessionNote } from '../types'

export interface CreateSessionNoteData {
  patientId: number
  appointmentId?: number | null
  fecha: string
  motivo?: string
  notas?: string
  observaciones?: string
  seguimiento?: string
}

export const sessionNotesService = {
  async getAll(params?: { patientId?: number }) {
    const response = await api.get<ApiResponse<SessionNote[]>>('/api/session-notes', { params })
    return response.data
  },
  async getById(id: number) {
    const response = await api.get<ApiResponse<SessionNote>>(`/api/session-notes/${id}`)
    return response.data
  },
  async create(data: CreateSessionNoteData) {
    const response = await api.post<ApiResponse<SessionNote>>('/api/session-notes', data)
    return response.data
  },
  async update(id: number, data: Partial<CreateSessionNoteData>) {
    const response = await api.put<ApiResponse<SessionNote>>(`/api/session-notes/${id}`, data)
    return response.data
  },
}
