<template>
  <div class="max-w-4xl rounded-[2rem] bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-4 sm:p-6">
    <div class="mb-6 flex items-center gap-3 rounded-[1.5rem] border border-rose-100 bg-rose-100/70 p-4 shadow-sm">
      <button @click="router.back()" class="rounded-xl p-2 text-rose-700 transition hover:bg-rose-200/70 hover:text-primary-800">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h2 class="text-xl font-semibold text-primary-900">{{ isEdit ? 'Editar Nota' : 'Nueva Nota de Sesión' }}</h2>
        <p class="mt-1 text-sm text-rose-700">Registra de forma clara la información de la sesión.</p>
      </div>
    </div>

    <div class="card border-rose-100 bg-fuchsia-50/80 shadow-[0_10px_35px_-12px_rgba(225,29,72,0.2)]">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="label text-rose-900">Paciente</label>
          <select v-model.number="form.patientId" class="input-field" :class="{'border-red-500 ring-4 ring-red-50': errors.patientId}" @change="loadPatientAppointments">
            <option :value="0">Seleccionar paciente...</option>
            <option v-for="p in patients" :key="p.id" :value="p.id">{{ p.nombre }} ({{ p.expediente }})</option>
          </select>
          <p v-if="errors.patientId" class="text-red-500 text-xs mt-1">{{ errors.patientId }}</p>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label class="label text-rose-900">Cita relacionada (opcional)</label>
          <select v-model.number="form.appointmentId" class="input-field">
            <option :value="null">Sin cita asociada</option>
            <option v-for="a in patientAppointments" :key="a.id" :value="a.id">
              {{ formatShortDate(a.fecha) }} - {{ formatTime(a.horaInicio) }} ({{ a.estado }})
            </option>
          </select>
        </div>

        <div>
          <label class="label text-rose-900">Fecha</label>
          <input v-model="form.fecha" type="date" class="input-field" :class="{'border-red-500 ring-4 ring-red-50': errors.fecha}" />
          <p v-if="errors.fecha" class="text-red-500 text-xs mt-1">{{ errors.fecha }}</p>
        </div>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label class="label text-rose-900">Motivo de consulta</label>
          <textarea v-model="form.motivo" rows="2" class="input-field" placeholder="Motivo de la consulta..."></textarea>
        </div>

        <div>
          <label class="label text-rose-900">Notas de sesión</label>
          <textarea v-model="form.notas" rows="6" class="input-field" placeholder="Registra las notas de la sesión..."></textarea>
        </div>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label class="label text-rose-900">Observaciones</label>
          <textarea v-model="form.observaciones" rows="2" class="input-field" placeholder="Observaciones adicionales..."></textarea>
        </div>

        <div>
          <label class="label text-rose-900">Acuerdos y seguimiento</label>
          <textarea v-model="form.seguimiento" rows="2" class="input-field" placeholder="Acuerdos, tareas o seguimiento..."></textarea>
        </div>
        </div>

        <div v-if="serverError" class="rounded-xl border border-red-200 bg-red-50 p-3">
          <p class="text-red-700 text-sm">{{ serverError }}</p>
        </div>

        <div class="flex flex-col-reverse justify-end gap-3 border-t border-rose-100 pt-5 sm:flex-row">
          <button type="button" @click="router.back()" class="btn-secondary sm:min-w-32">Cancelar</button>
          <button type="submit" class="btn-primary sm:min-w-40" :disabled="loading">
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
