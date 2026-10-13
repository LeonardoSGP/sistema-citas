<template>
  <div class="max-w-4xl rounded-[2rem] bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-4 sm:p-6">
    <div class="mb-6 flex items-center gap-3 rounded-[1.5rem] border border-rose-100 bg-rose-100/70 p-4 shadow-sm">
      <button @click="router.back()" class="rounded-xl p-2 text-rose-700 transition hover:bg-rose-200/70 hover:text-primary-800">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h2 class="text-xl font-semibold text-primary-900">{{ isEdit ? 'Editar Paciente' : 'Nuevo Paciente' }}</h2>
        <p class="mt-1 text-sm text-rose-700">Registra la información principal del paciente.</p>
      </div>
    </div>

    <div class="card border-rose-100 bg-fuchsia-50/80 shadow-[0_10px_35px_-12px_rgba(225,29,72,0.2)]">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label class="label text-rose-900">Número de Expediente <span class="font-normal text-rose-500">(opcional)</span></label>
          <input v-model="form.expediente" type="text" class="input-field"
            :class="{ 'border-red-500 ring-4 ring-red-50': errors.expediente }" placeholder="001 o 0001"
            maxlength="4" @input="onExpedienteInput" />
          <p v-if="errors.expediente" class="mt-1 text-xs text-red-500">{{ errors.expediente }}</p>
        </div>

        <div>
          <label class="label text-rose-900">Nombre completo</label>
          <input v-model="form.nombre" type="text" class="input-field"
            :class="{ 'border-red-500 ring-4 ring-red-50': errors.nombre }" placeholder="Nombre del paciente" />
          <p v-if="errors.nombre" class="mt-1 text-xs text-red-500">{{ errors.nombre }}</p>
        </div>

        <div>
          <label class="label text-rose-900">Teléfono <span class="font-normal text-rose-500">(opcional)</span></label>
          <input v-model="form.telefono" type="tel" class="input-field"
            :class="{ 'border-red-500 ring-4 ring-red-50': errors.telefono }" placeholder="5512345678"
            maxlength="10" @input="onTelefonoInput" />
          <p v-if="errors.telefono" class="mt-1 text-xs text-red-500">{{ errors.telefono }}</p>
        </div>

        <div>
          <label class="label text-rose-900">Edad</label>
          <input v-model.number="form.edad" type="number" min="0" max="150" class="input-field"
            :class="{ 'border-red-500 ring-4 ring-red-50': errors.edad }" placeholder="0"
            @input="onEdadInput" />
          <p v-if="errors.edad" class="mt-1 text-xs text-red-500">{{ errors.edad }}</p>
        </div>

        <div>
          <label class="label text-rose-900">Sexo</label>
          <select v-model="form.sexo" class="input-field" :class="{ 'border-red-500 ring-4 ring-red-50': errors.sexo }">
            <option value="">Seleccionar...</option>
            <option value="Femenino">Femenino</option>
            <option value="Masculino">Masculino</option>
            <option value="Otro">Otro</option>
          </select>
          <p v-if="errors.sexo" class="mt-1 text-xs text-red-600">{{ errors.sexo }}</p>
        </div>
        </div>

        <div v-if="serverError" class="rounded-xl border border-red-200 bg-red-50 p-3">
          <p class="text-red-700 text-sm">{{ serverError }}</p>
        </div>

        <div class="flex flex-col-reverse justify-end gap-3 border-t border-rose-100 pt-5 sm:flex-row">
          <button type="button" @click="router.back()" class="btn-secondary sm:min-w-32">Cancelar</button>
          <button type="submit" class="btn-primary sm:min-w-40" :disabled="loading">
            {{ loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Registrar') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { patientsService } from '../../services/patients.service'
import { useNotification } from '../../composables/useNotification'

const router = useRouter()
const route = useRoute()
const { success, error } = useNotification()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const serverError = ref('')

const form = reactive({ expediente: '', nombre: '', telefono: '', edad: 0, sexo: '' })
const errors = reactive({ expediente: '', nombre: '', telefono: '', edad: '', sexo: '' })

function onExpedienteInput(e: Event) {
  const input = e.target as HTMLInputElement
  form.expediente = input.value.replace(/\D/g, '').slice(0, 4)
}

function onTelefonoInput(e: Event) {
  const input = e.target as HTMLInputElement
  form.telefono = input.value.replace(/\D/g, '').slice(0, 10)
}

function onEdadInput(e: Event) {
  const input = e.target as HTMLInputElement
  form.edad = input.value === '' ? 0 : Number(input.value)
}

function validate() {
  let valid = true
  errors.expediente = ''
  errors.nombre = ''
  errors.telefono = ''
  errors.edad = ''
  errors.sexo = ''

  if (form.expediente.trim() && !/^\d{3,4}$/.test(form.expediente)) {
    errors.expediente = 'El expediente debe tener 3 o 4 dígitos numéricos'; valid = false
  }
  if (!form.nombre.trim()) { errors.nombre = 'El nombre es obligatorio'; valid = false }
  if (form.telefono.trim() && !/^\d{10}$/.test(form.telefono)) {
    errors.telefono = 'El teléfono debe tener 10 dígitos numéricos'; valid = false
  }
  if (form.edad < 0 || form.edad > 150) { errors.edad = 'La edad debe ser entre 0 y 150'; valid = false }
  if (!form.sexo) { errors.sexo = 'El sexo es obligatorio'; valid = false }
  return valid
}

async function handleSubmit() {
  if (!validate()) return
  loading.value = true
  serverError.value = ''
  try {
    if (isEdit.value) {
      await patientsService.update(Number(route.params.id), form)
      success('Paciente actualizado correctamente')
    } else {
      await patientsService.create(form)
      success('Paciente registrado correctamente')
    }
    router.push('/patients')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    serverError.value = e.response?.data?.message || 'Error al guardar paciente'
    error(serverError.value)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    try {
      const response = await patientsService.getById(Number(route.params.id))
      Object.assign(form, {
        expediente: response.data.expediente,
        nombre: response.data.nombre,
        telefono: response.data.telefono,
        edad: response.data.edad,
        sexo: response.data.sexo,
      })
    } catch {
      error('Error al cargar datos del paciente')
      router.push('/patients')
    }
  }
})
</script>
