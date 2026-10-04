import api from './api'
import type { ApiResponse, User } from '../types'

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>('/api/auth/login', { email, password })
    return response.data
  },
  async getProfile() {
    const response = await api.get<ApiResponse<User>>('/api/auth/profile')
    return response.data
  },
  async updateProfile(data: { nombre: string; email: string }) {
    const response = await api.put<ApiResponse<User>>('/api/auth/profile', data)
    return response.data
  },
  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await api.put<ApiResponse<null>>('/api/auth/password', data)
    return response.data
  },
  async logout() {
    try { await api.post('/api/auth/logout') } catch { /* ignore */ }
  },
}
