<template>
  <div class="max-w-lg">
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.back()" class="p-2 rounded-lg hover:bg-slate-200">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 class="text-xl font-semibold text-slate-900">{{ isEdit ? 'Editar Nota' : 'Nueva Nota de Sesión' }}</h2>
    </div>

    <div class="card">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="label">Paciente *</label>
          <select v-model.number="form.patientId" class="input-field" @change="loadPatientAppointments">
            <option :value="0">Seleccionar paciente...</option>
            <option v-for="p in patients" :key="p.id" :value="p.id">{{ p.nombre }} ({{ p.expediente }})</option>
          </select>
          <p v-if="errors.patientId" class="text-red-600 text-xs mt-1">{{ errors.patientId }}</p>
        </div>

        <div>
          <label class="label">Cita relacionada (opcional)</label>
          <select v-model.number="form.appointmentId" class="input-field">
            <option :value="null">Sin cita asociada</option>
            <option v-for="a in patientAppointments" :key="a.id" :value="a.id">
              {{ formatShortDate(a.fecha) }} - {{ formatTime(a.horaInicio) }} ({{ a.estado }})
            </option>
          </select>
        </div>

        <div>
          <label class="label">Fecha *</label>
          <input v-model="form.fecha" type="date" class="input-field" :class="{'border-red-500': errors.fecha}" />
          <p v-if="errors.fecha" class="text-red-600 text-xs mt-1">{{ errors.fecha }}</p>
        </div>

        <div>
          <label class="label">Motivo de consulta</label>
          <textarea v-model="form.motivo" rows="2" class="input-field" placeholder="Motivo de la consulta..."></textarea>
        </div>

        <div>
          <label class="label">Notas de sesión</label>
          <textarea v-model="form.notas" rows="4" class="input-field" placeholder="Registra las notas de la sesión..."></textarea>
        </div>

        <div>
          <label class="label">Observaciones</label>
          <textarea v-model="form.observaciones" rows="2" class="input-field" placeholder="Observaciones adicionales..."></textarea>
        </div>

        <div>
          <label class="label">Acuerdos y seguimiento</label>
          <textarea v-model="form.seguimiento" rows="2" class="input-field" placeholder="Acuerdos, tareas o seguimiento..."></textarea>
        </div>

        <div v-if="serverError" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-red-700 text-sm">{{ serverError }}</p>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" @click="router.back()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1" :disabled="loading">
            {{ loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Guardar Nota') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { sessionNotesService } from '../../services/sessionNotes.service'
import { patientsService } from '../../services/patients.service'
import { appointmentsService } from '../../services/appointments.service'
import type { Patient, Appointment } from '../../types'
import { useNotification } from '../../composables/useNotification'
import { useFormatters } from '../../composables/useFormatters'

const router = useRouter()
const route = useRoute()
const { success, error } = useNotification()
const { formatShortDate, formatTime } = useFormatters()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const serverError = ref('')
const patients = ref<Patient[]>([])
const patientAppointments = ref<Appointment[]>([])

const form = reactive({
  patientId: 0,
  appointmentId: null as number | null,
  fecha: new Date().toISOString().substring(0, 10),
  motivo: '',
  notas: '',
  observaciones: '',
  seguimiento: '',
})

const errors = reactive({ patientId: '', fecha: '' })

async function loadPatientAppointments() {
  if (!form.patientId) { patientAppointments.value = []; return }
  try {
    const response = await appointmentsService.getAll({ patientId: form.patientId })
    patientAppointments.value = response.data
  } catch { /* ignore */ }
}

function validate() {
  let valid = true
  errors.patientId = ''
  errors.fecha = ''
  if (!form.patientId) { errors.patientId = 'El paciente es obligatorio'; valid = false }
  if (!form.fecha) { errors.fecha = 'La fecha es obligatoria'; valid = false }
  return valid
}

async function handleSubmit() {
  if (!validate()) return
  loading.value = true
  serverError.value = ''
  try {
    if (isEdit.value) {
      await sessionNotesService.update(Number(route.params.id), form)
      success('Nota actualizada correctamente')
    } else {
      await sessionNotesService.create(form)
      success('Nota guardada correctamente')
    }
    router.back()
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    serverError.value = e.response?.data?.message || 'Error al guardar la nota'
    error(serverError.value)
  } finally { loading.value = false }
}

onMounted(async () => {
  try {
    const pRes = await patientsService.getAll({ activo: true })
    patients.value = pRes.data

    // Pre-fill from query params
    if (route.query.patientId) {
      form.patientId = Number(route.query.patientId)
      await loadPatientAppointments()
    }
    if (route.query.appointmentId) {
      form.appointmentId = Number(route.query.appointmentId)
    }

    if (isEdit.value) {
      const nRes = await sessionNotesService.getById(Number(route.params.id))
      const note = nRes.data
      form.patientId = note.patientId
      form.appointmentId = note.appointmentId || null
      form.fecha = note.fecha.substring(0, 10)
      form.motivo = note.motivo || ''
      form.notas = note.notas || ''
      form.observaciones = note.observaciones || ''
      form.seguimiento = note.seguimiento || ''
      await loadPatientAppointments()
    }
  } catch { error('Error al cargar datos') }
})
</script>
