import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/auth.service'
import type { User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token') || sessionStorage.getItem('token'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  async function login(email: string, password: string, rememberMe: boolean) {
    loading.value = true
    try {
      const response = await authService.login(email, password, rememberMe)
      token.value = response.data.token
      user.value = response.data.user
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem('token', response.data.token)
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const response = await authService.getProfile()
      user.value = response.data
    } catch {
      logout()
    }

  }

  function setUser(updatedUser: User) {
    user.value = updatedUser
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
  }

  return { user, token, loading, isAuthenticated, login, fetchProfile, setUser, logout }
})
