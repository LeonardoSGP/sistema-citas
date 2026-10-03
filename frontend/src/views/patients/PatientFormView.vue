<template>
  <div class="max-w-lg">
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.back()" class="p-2 rounded-lg hover:bg-slate-200">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 class="text-xl font-semibold text-slate-900">{{ isEdit ? 'Editar Paciente' : 'Nuevo Paciente' }}</h2>
    </div>

    <div class="card">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="label">Número de Expediente *</label>
          <input v-model="form.expediente" type="text" class="input-field"
            :class="{ 'border-red-500': errors.expediente }" placeholder="EXP-001" />
          <p v-if="errors.expediente" class="text-red-600 text-xs mt-1">{{ errors.expediente }}</p>
        </div>

        <div>
          <label class="label">Nombre completo *</label>
          <input v-model="form.nombre" type="text" class="input-field"
            :class="{ 'border-red-500': errors.nombre }" placeholder="Nombre del paciente" />
          <p v-if="errors.nombre" class="text-red-600 text-xs mt-1">{{ errors.nombre }}</p>
        </div>

        <div>
          <label class="label">Edad *</label>
          <input v-model.number="form.edad" type="number" min="0" max="150" class="input-field"
            :class="{ 'border-red-500': errors.edad }" placeholder="25" />
          <p v-if="errors.edad" class="text-red-600 text-xs mt-1">{{ errors.edad }}</p>
        </div>

        <div>
          <label class="label">Sexo *</label>
          <select v-model="form.sexo" class="input-field" :class="{ 'border-red-500': errors.sexo }">
            <option value="">Seleccionar...</option>
            <option value="Femenino">Femenino</option>
            <option value="Masculino">Masculino</option>
            <option value="Otro">Otro</option>
          </select>
          <p v-if="errors.sexo" class="text-red-600 text-xs mt-1">{{ errors.sexo }}</p>
        </div>

        <div v-if="serverError" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-red-700 text-sm">{{ serverError }}</p>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" @click="router.back()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1" :disabled="loading">
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

const form = reactive({ expediente: '', nombre: '', edad: 0, sexo: '' })
const errors = reactive({ expediente: '', nombre: '', edad: '', sexo: '' })

function validate() {
  let valid = true
  errors.expediente = ''
  errors.nombre = ''
  errors.edad = ''
  errors.sexo = ''

  if (!form.expediente.trim()) { errors.expediente = 'El número de expediente es obligatorio'; valid = false }
  if (!form.nombre.trim()) { errors.nombre = 'El nombre es obligatorio'; valid = false }
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
