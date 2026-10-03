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
  async logout() {
    try { await api.post('/api/auth/logout') } catch { /* ignore */ }
  },
}
