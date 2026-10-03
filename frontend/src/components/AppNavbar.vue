<template>
  <header class="bg-white border-b border-slate-200 h-16 flex items-center px-4 lg:px-6 gap-4">
    <button @click="$emit('toggleSidebar')" class="p-2 rounded-lg hover:bg-slate-100 lg:hidden">
      <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <h1 class="font-semibold text-slate-900 flex-1 text-lg">{{ title }}</h1>

    <div class="flex items-center gap-3">
      <span class="text-sm text-slate-600 hidden sm:block">{{ authStore.user?.nombre }}</span>
      <button
        @click="handleLogout"
        class="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span class="hidden sm:block">Salir</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

defineEmits<{ toggleSidebar: [] }>()

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/patients': 'Pacientes',
  '/appointments': 'Citas',
  '/session-notes': 'Notas de Sesión',
  '/settings': 'Configuración',
}

const title = computed(() => {
  const path = '/' + route.path.split('/')[1]
  return routeTitles[path] || 'Consulta Psicológica'
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
