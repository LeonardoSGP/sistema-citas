<template>
  <div class="max-w-lg space-y-6">
    <div class="card">
      <h3 class="font-semibold text-slate-900 mb-4">Información del perfil</h3>
      <div class="space-y-3">
        <div>
          <p class="text-sm text-slate-500">Nombre</p>
          <p class="font-medium text-slate-900">{{ authStore.user?.nombre }}</p>
        </div>
        <div>
          <p class="text-sm text-slate-500">Correo electrónico</p>
          <p class="font-medium text-slate-900">{{ authStore.user?.email }}</p>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="font-semibold text-slate-900 mb-2">Sesión</h3>
      <p class="text-sm text-slate-500 mb-4">Cierra tu sesión actual de forma segura.</p>
      <button @click="handleLogout" class="btn-danger">
        Cerrar sesión
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
