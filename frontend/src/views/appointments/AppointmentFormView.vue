<template>
  <div class="max-w-4xl rounded-[2rem] bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-4 sm:p-6">
    <div class="mb-6 flex items-center gap-3 rounded-[1.5rem] border border-rose-100 bg-rose-100/70 p-4 shadow-sm">
      <button @click="router.back()" class="rounded-xl p-2 text-rose-700 transition hover:bg-rose-200/70 hover:text-primary-800">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h2 class="text-xl font-semibold text-primary-900">{{ isEdit ? 'Editar Cita' : 'Nueva Cita' }}</h2>
        <p class="mt-1 text-sm text-rose-700">Programa y organiza los detalles de la consulta.</p>
      </div>
    </div>

    <div class="card border-rose-100 bg-fuchsia-50/80 shadow-[0_10px_35px_-12px_rgba(225,29,72,0.2)]">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="label text-rose-900">Paciente</label>
          <select v-model.number="form.patientId" class="input-field" :class="{'border-red-500 ring-4 ring-red-50': errors.patientId}">
            <option :value="0">Seleccionar paciente...</option>
            <option v-for="p in patients" :key="p.id" :value="p.id">{{ p.nombre }} ({{ p.expediente }})</option>
          </select>
          <p v-if="errors.patientId" class="text-red-500 text-xs mt-1">{{ errors.patientId }}</p>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label class="label text-rose-900">Fecha</label>
          <input v-model="form.fecha" type="date" class="input-field" :class="{'border-red-500 ring-4 ring-red-50': errors.fecha}" :min="todayStr" />
          <p v-if="errors.fecha" class="text-red-500 text-xs mt-1">{{ errors.fecha }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label text-rose-900">Hora inicio</label>
            <input v-model="form.horaInicio" type="time" min="08:00" max="14:00" class="input-field" :class="{'border-red-500 ring-4 ring-red-50': errors.horaInicio}" />
            <p v-if="errors.horaInicio" class="text-red-500 text-xs mt-1">{{ errors.horaInicio }}</p>
          </div>
          <div>
            <label class="label text-rose-900">Hora fin</label>
            <input v-model="form.horaFin" type="time" min="08:00" max="14:00" class="input-field" :class="{'border-red-500 ring-4 ring-red-50': errors.horaFin}" />
            <p v-if="errors.horaFin" class="text-red-500 text-xs mt-1">{{ errors.horaFin }}</p>
          </div>
        </div>
        </div>

        <div>
          <label class="label text-rose-900">Estado</label>
          <select v-model="form.estado" class="input-field">
            <option value="Programada">Programada</option>
            <option value="Atendida">Atendida</option>
            <option value="No asistió">No asistió</option>
          </select>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label class="label text-rose-900">Motivo de consulta</label>
          <textarea v-model="form.motivo" rows="2" class="input-field" placeholder="Motivo de la consulta..."></textarea>
        </div>

        <div>
          <label class="label text-rose-900">Observaciones</label>
          <textarea v-model="form.observaciones" rows="2" class="input-field" placeholder="Observaciones adicionales..."></textarea>
        </div>
        </div>

        <div v-if="serverError" class="rounded-xl border border-red-200 bg-red-50 p-3">
          <p class="text-red-700 text-sm">{{ serverError }}</p>
        </div>

        <div class="flex flex-col-reverse justify-end gap-3 border-t border-rose-100 pt-5 sm:flex-row">
          <button type="button" @click="router.back()" class="btn-secondary sm:min-w-32">Cancelar</button>
          <button type="submit" class="btn-primary sm:min-w-40" :disabled="loading">
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

const todayStr = computed(() => {
  const d = new Date()
  return d.toISOString().substring(0, 10)
})

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
  if (!form.fecha) {
    errors.fecha = 'La fecha es obligatoria'; valid = false
  } else {
    const selectedDate = new Date(form.fecha + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      errors.fecha = 'No se pueden agendar citas en fechas pasadas'; valid = false
    }
  }
  if (!form.horaInicio) { errors.horaInicio = 'La hora de inicio es obligatoria'; valid = false }
  if (!form.horaFin) { errors.horaFin = 'La hora de fin es obligatoria'; valid = false }
  if (form.horaInicio && form.horaInicio < '08:00') {
    errors.horaInicio = 'Las citas deben iniciar a partir de las 08:00'
    valid = false
  }
  if (form.horaFin && form.horaFin > '14:00') {
    errors.horaFin = 'Las citas deben terminar a más tardar a las 14:00'
    valid = false
  }
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
    await router.replace({ path: '/appointments', query: { refreshed: String(Date.now()) } })
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
    const pResponse = await patientsService.getAll()
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
