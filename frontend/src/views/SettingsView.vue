<template>
  <div class="min-h-full rounded-[2rem] bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-4 sm:p-6">
    <div class="mx-auto max-w-6xl space-y-6">
      <div class="rounded-[1.75rem] border border-rose-100 bg-rose-100/70 p-5 shadow-sm">
        <h2 class="text-xl font-semibold text-primary-900">Configuración</h2>
        <p class="mt-1 text-sm text-rose-700">Administra tu información y seguridad.</p>
      </div>

      <div class="grid items-stretch gap-6 lg:grid-cols-2">
      <section class="card flex h-full flex-col border-rose-100 bg-fuchsia-50/80">
        <div class="flex min-h-[64px] items-start justify-between gap-4">
          <div>
            <h3 class="font-semibold text-primary-900">Información del perfil</h3>
            <p class="mt-1 text-sm text-rose-700">Actualiza tu nombre y correo electrónico.</p>
          </div>
          <button v-if="!editingProfile" type="button" class="btn-primary btn-sm shrink-0 px-3" @click="startProfileEdit">Editar</button>
        </div>

        <form v-if="editingProfile" class="mt-5 flex flex-1 flex-col gap-4" @submit.prevent="saveProfile">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div>
            <label class="label text-rose-900">Nombre</label>
            <input v-model="profileForm.nombre" class="input-field border-rose-200 bg-rose-50/80" type="text" required />
          </div>
          <div>
            <label class="label text-rose-900">Correo electrónico</label>
            <input v-model="profileForm.email" class="input-field border-rose-200 bg-rose-50/80" type="email" required />
          </div>
          </div>
          <p v-if="profileError" class="rounded-xl border border-rose-200 bg-rose-100 px-3 py-2 text-sm text-rose-800">{{ profileError }}</p>
          <div class="mt-auto flex flex-wrap gap-2">
            <button type="submit" class="btn-primary btn-sm" :disabled="savingProfile">{{ savingProfile ? 'Guardando...' : 'Guardar cambios' }}</button>
            <button type="button" class="btn-secondary btn-sm" @click="editingProfile = false">Cancelar</button>
          </div>
        </form>

        <div v-else class="mt-5 grid flex-1 content-start gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div class="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
            <p class="text-sm text-rose-700">Nombre</p>
            <p class="mt-1 break-words font-medium text-rose-950">{{ authStore.user?.nombre }}</p>
          </div>
          <div class="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
            <p class="text-sm text-rose-700">Correo electrónico</p>
            <p class="mt-1 break-words font-medium text-rose-950">{{ authStore.user?.email }}</p>
          </div>
        </div>
      </section>

      <section class="card flex h-full flex-col border-rose-100 bg-fuchsia-50/80">
        <div class="flex min-h-[64px] items-start justify-between gap-4">
          <div>
            <h3 class="font-semibold text-primary-900">Cambiar contraseña</h3>
            <p class="mt-1 text-sm text-rose-700">Usa una contraseña de al menos 8 caracteres.</p>
          </div>
          <button v-if="!changingPassword" type="button" class="btn-primary btn-sm shrink-0 px-3" @click="changingPassword = true">Cambiar</button>
        </div>

        <form v-if="changingPassword" class="mt-5 flex flex-1 flex-col gap-4" @submit.prevent="savePassword">
          <div class="grid gap-4 xl:grid-cols-3">
          <div v-for="field in passwordFields" :key="field.key" class="flex flex-col">
            <label class="label flex min-h-[2.5rem] items-start whitespace-nowrap text-xs text-rose-900 sm:text-sm">{{ field.label }}</label>
            <div class="relative">
              <input
                v-model="passwordForm[field.key]"
                :type="visiblePasswords[field.key] ? 'text' : 'password'"
                class="input-field border-rose-200 bg-rose-50/80 pr-12"
                required
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 hover:text-primary-700"
                :aria-label="visiblePasswords[field.key] ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="visiblePasswords[field.key] = !visiblePasswords[field.key]"
              >
                <svg v-if="visiblePasswords[field.key]" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A9.7 9.7 0 0112 5c5 0 9 7 9 7a17.3 17.3 0 01-3.1 3.7M6.1 6.1C3.9 7.7 3 12 3 12s4 7 9 7a9.7 9.7 0 004.1-.9" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7zM12 15a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              </button>
            </div>
          </div>
          </div>
          <p v-if="passwordError" class="rounded-xl border border-rose-200 bg-rose-100 px-3 py-2 text-sm text-rose-800">{{ passwordError }}</p>
          <div class="mt-auto flex flex-wrap gap-2">
            <button type="submit" class="btn-primary btn-sm" :disabled="savingPassword">{{ savingPassword ? 'Guardando...' : 'Actualizar' }}</button>
            <button type="button" class="btn-secondary btn-sm" @click="cancelPasswordChange">Cancelar</button>
          </div>
        </form>
        <div v-else class="mt-5 flex flex-1 items-start rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
          <p class="text-sm leading-6 text-rose-800">Tu contraseña está protegida. Usa el botón <span class="font-semibold">Cambiar</span> para actualizarla de forma segura.</p>
        </div>
      </section>
      </div>

      <section class="card flex flex-col gap-4 border-rose-100 bg-fuchsia-50/80 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="font-semibold text-primary-900">Sesión</h3>
          <p class="mt-1 text-sm text-rose-700">Cierra tu sesión actual de forma segura.</p>
        </div>
        <button type="button" @click="handleLogout" class="btn-danger btn-sm self-start sm:self-auto">Cerrar sesión</button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { authService } from '../services/auth.service'
import { useNotification } from '../composables/useNotification'

const authStore = useAuthStore()
const router = useRouter()
const { success } = useNotification()
const editingProfile = ref(false)
const changingPassword = ref(false)
const savingProfile = ref(false)
const savingPassword = ref(false)
const profileError = ref('')
const passwordError = ref('')
const profileForm = ref({ nombre: '', email: '' })
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const visiblePasswords = ref({ currentPassword: false, newPassword: false, confirmPassword: false })
const passwordFields = [
  { key: 'currentPassword' as const, label: 'Contraseña actual' },
  { key: 'newPassword' as const, label: 'Nueva contraseña' },
  { key: 'confirmPassword' as const, label: 'Confirmar contraseña' },
]

function startProfileEdit() {
  profileForm.value = { nombre: authStore.user?.nombre || '', email: authStore.user?.email || '' }
  profileError.value = ''
  editingProfile.value = true
}

async function saveProfile() {
  savingProfile.value = true
  profileError.value = ''
  try {
    const response = await authService.updateProfile(profileForm.value)
    authStore.setUser(response.data)
    success('Información actualizada correctamente')
    editingProfile.value = false
  } catch (error: unknown) {
    profileError.value = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'No se pudo actualizar la información'
  } finally {
    savingProfile.value = false
  }
}

async function savePassword() {
  passwordError.value = ''
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Las contraseñas nuevas no coinciden'
    return
  }
  savingPassword.value = true
  try {
    await authService.changePassword({ currentPassword: passwordForm.value.currentPassword, newPassword: passwordForm.value.newPassword })
    success('Contraseña actualizada correctamente')
    cancelPasswordChange()
  } catch (error: unknown) {
    passwordError.value = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'No se pudo actualizar la contraseña'
  } finally {
    savingPassword.value = false
  }
}

function cancelPasswordChange() {
  changingPassword.value = false
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  visiblePasswords.value = { currentPassword: false, newPassword: false, confirmPassword: false }
  passwordError.value = ''
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
