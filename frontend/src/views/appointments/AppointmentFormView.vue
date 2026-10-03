<template>
  <div class="max-w-lg">
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.back()" class="p-2 rounded-lg hover:bg-slate-200">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 class="text-xl font-semibold text-slate-900">{{ isEdit ? 'Editar Cita' : 'Nueva Cita' }}</h2>
    </div>

    <div class="card">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="label">Paciente *</label>
          <select v-model.number="form.patientId" class="input-field" :class="{'border-red-500': errors.patientId}">
            <option :value="0">Seleccionar paciente...</option>
            <option v-for="p in patients" :key="p.id" :value="p.id">{{ p.nombre }} ({{ p.expediente }})</option>
          </select>
          <p v-if="errors.patientId" class="text-red-600 text-xs mt-1">{{ errors.patientId }}</p>
        </div>

        <div>
          <label class="label">Fecha *</label>
          <input v-model="form.fecha" type="date" class="input-field" :class="{'border-red-500': errors.fecha}" />
          <p v-if="errors.fecha" class="text-red-600 text-xs mt-1">{{ errors.fecha }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Hora inicio *</label>
            <input v-model="form.horaInicio" type="time" class="input-field" :class="{'border-red-500': errors.horaInicio}" />
            <p v-if="errors.horaInicio" class="text-red-600 text-xs mt-1">{{ errors.horaInicio }}</p>
          </div>
          <div>
            <label class="label">Hora fin *</label>
            <input v-model="form.horaFin" type="time" class="input-field" :class="{'border-red-500': errors.horaFin}" />
            <p v-if="errors.horaFin" class="text-red-600 text-xs mt-1">{{ errors.horaFin }}</p>
          </div>
        </div>

        <div>
          <label class="label">Estado</label>
          <select v-model="form.estado" class="input-field">
            <option value="Programada">Programada</option>
            <option value="Confirmada">Confirmada</option>
            <option value="Atendida">Atendida</option>
            <option value="Cancelada">Cancelada</option>
            <option value="No asistió">No asistió</option>
          </select>
        </div>

        <div>
          <label class="label">Motivo de consulta</label>
          <textarea v-model="form.motivo" rows="2" class="input-field" placeholder="Motivo de la consulta..."></textarea>
        </div>

        <div>
          <label class="label">Observaciones</label>
          <textarea v-model="form.observaciones" rows="2" class="input-field" placeholder="Observaciones adicionales..."></textarea>
        </div>

        <div v-if="serverError" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-red-700 text-sm">{{ serverError }}</p>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" @click="router.back()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1" :disabled="loading">
            {{ loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Cita') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { appointmentsService } from '../../services/appointments.service'
import { patientsService } from '../../services/patients.service'
import type { Patient, AppointmentStatus } from '../../types'
import { useNotification } from '../../composables/useNotification'

const router = useRouter()
const route = useRoute()
const { success, error } = useNotification()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const serverError = ref('')
const patients = ref<Patient[]>([])

const form = reactive({
  patientId: 0,
  fecha: '',
  horaInicio: '',
  horaFin: '',
  estado: 'Programada' as AppointmentStatus,
  motivo: '',
  observaciones: '',
})

const errors = reactive({
  patientId: '',
  fecha: '',
  horaInicio: '',
  horaFin: '',
})

function validate() {
  let valid = true
  errors.patientId = ''
  errors.fecha = ''
  errors.horaInicio = ''
  errors.horaFin = ''

  if (!form.patientId) { errors.patientId = 'El paciente es obligatorio'; valid = false }
  if (!form.fecha) { errors.fecha = 'La fecha es obligatoria'; valid = false }
  if (!form.horaInicio) { errors.horaInicio = 'La hora de inicio es obligatoria'; valid = false }
  if (!form.horaFin) { errors.horaFin = 'La hora de fin es obligatoria'; valid = false }
  if (form.horaInicio && form.horaFin && form.horaFin <= form.horaInicio) {
    errors.horaFin = 'La hora de fin debe ser posterior a la hora de inicio'
    valid = false
  }
  return valid
}

async function handleSubmit() {
  if (!validate()) return
  loading.value = true
  serverError.value = ''
  try {
    if (isEdit.value) {
      await appointmentsService.update(Number(route.params.id), form)
      success('Cita actualizada correctamente')
    } else {
      await appointmentsService.create(form)
      success('Cita creada correctamente')
    }
    router.push('/appointments')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    serverError.value = e.response?.data?.message || 'Error al guardar la cita'
    error(serverError.value)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const pResponse = await patientsService.getAll({ activo: true })
    patients.value = pResponse.data

    // Pre-select patient if passed via query
    if (route.query.patientId) form.patientId = Number(route.query.patientId)

    if (isEdit.value) {
      const aResponse = await appointmentsService.getById(Number(route.params.id))
      const appt = aResponse.data
      form.patientId = appt.patientId
      form.fecha = appt.fecha.substring(0, 10)
      form.horaInicio = typeof appt.horaInicio === 'string' ? appt.horaInicio.substring(11, 16) : ''
      form.horaFin = typeof appt.horaFin === 'string' ? appt.horaFin.substring(11, 16) : ''
      form.estado = appt.estado
      form.motivo = appt.motivo || ''
      form.observaciones = appt.observaciones || ''
    }
  } catch {
    error('Error al cargar datos')
  }
})
</script>
