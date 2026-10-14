<template>
  <div class="space-y-6 max-w-6xl">
    <div class="flex items-center gap-3">
      <button v-if="!modal" @click="router.back()" class="p-2 rounded-lg hover:bg-slate-200">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 class="text-xl font-semibold text-slate-900">Detalle de Cita</h2>
    </div>

    <LoadingSpinner v-if="loading" />

    <template v-else-if="appointment">
      <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
      <div class="space-y-6">
      <div class="card">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-lg font-semibold text-slate-900">{{ appointment.patient?.nombre }}</p>
            <p class="text-sm text-slate-500 font-mono">{{ appointment.patient?.expediente }}</p>
          </div>
          <StatusBadge :status="appointment.estado" />
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-slate-500">Fecha</p>
            <p class="font-medium">{{ formatDate(appointment.fecha) }}</p>
          </div>
          <div>
            <p class="text-slate-500">Horario</p>
            <p class="font-medium">{{ formatTime(appointment.horaInicio) }} - {{ formatTime(appointment.horaFin) }}</p>
          </div>
          <div class="col-span-2" v-if="appointment.motivo">
            <p class="text-slate-500">Motivo</p>
            <p class="font-medium">{{ appointment.motivo }}</p>
          </div>
          <div class="col-span-2" v-if="appointment.observaciones">
            <p class="text-slate-500">Observaciones</p>
            <p class="font-medium">{{ appointment.observaciones }}</p>
          </div>
        </div>

        <!-- Status change -->
        <div class="mt-6 pt-4 border-t border-slate-200">
          <p class="text-sm text-slate-500 mb-3">Cambiar estado:</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="estado in statuses"
              :key="estado"
              @click="changeStatus(estado)"
              :disabled="appointment.estado === estado"
              class="px-3 py-1 rounded-full text-xs font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >{{ estado }}</button>
          </div>
        </div>

        <div class="mt-4 flex gap-3">
          <button type="button" class="btn-secondary" @click="showEditAppointment = true">Editar cita</button>
          <button type="button" class="btn-primary" @click="showNewNote = true">+ Nota de sesión</button>
        </div>
      </div>

      <!-- Session notes -->
      <div class="card">
        <h3 class="font-semibold text-slate-900 mb-4">Notas de sesión</h3>
        <EmptyState v-if="!appointment.sessionNotes?.length" title="Sin notas" description="No hay notas de sesión para esta cita" />
        <div v-else class="space-y-3">
          <div v-for="note in appointment.sessionNotes" :key="note.id" class="p-4 bg-slate-50 rounded-lg">
            <p class="text-sm font-medium text-slate-700 mb-1">{{ formatDate(note.fecha) }}</p>
            <p v-if="note.motivo" class="text-sm text-slate-600">{{ note.motivo }}</p>
            <p v-if="note.notas" class="text-sm text-slate-500 mt-1">{{ note.notas }}</p>
          </div>
        </div>
      </div>
      </div>

      <aside class="card relative min-h-[420px] overflow-hidden border-rose-100 bg-gradient-to-br from-rose-50 to-fuchsia-50 lg:sticky lg:top-6">
        <div class="mb-5 flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-primary-600">Paciente</p>
            <h3 class="mt-1 text-xl font-semibold text-slate-900">{{ appointment.patient?.nombre }}</h3>
          </div>
          <StatusBadge :status="appointment.patient?.activo ? 'Activo' : 'Inactivo'" />
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-xl border border-rose-100 bg-white/70 p-3">
            <p class="text-xs text-slate-500">Expediente</p>
            <p class="mt-1 font-semibold text-primary-700">{{ appointment.patient?.expediente || 'Sin asignar' }}</p>
          </div>
          <div class="rounded-xl border border-rose-100 bg-white/70 p-3">
            <p class="text-xs text-slate-500">Edad</p>
            <p class="mt-1 font-semibold text-slate-800">{{ appointment.patient?.edad ?? 0 }} años</p>
          </div>
          <div class="rounded-xl border border-rose-100 bg-white/70 p-3">
            <p class="text-xs text-slate-500">Sexo</p>
            <p class="mt-1 font-semibold text-slate-800">{{ appointment.patient?.sexo || 'Sin registrar' }}</p>
          </div>
          <div class="rounded-xl border border-rose-100 bg-white/70 p-3">
            <p class="text-xs text-slate-500">Teléfono</p>
            <p class="mt-1 break-all font-semibold text-slate-800">{{ appointment.patient?.telefono || 'Sin registrar' }}</p>
          </div>
        </div>

        <button
          type="button"
          class="btn-primary mt-5 flex w-full justify-center"
          @click="startPatientEdit"
        >
          Editar paciente
        </button>
        <form v-if="editingPatient" class="absolute inset-0 z-10 space-y-3 overflow-y-auto rounded-2xl bg-gradient-to-br from-rose-50 to-fuchsia-50 p-5" @submit.prevent="savePatient">
          <div>
            <label class="label text-rose-900">Nombre completo</label>
            <input v-model="patientForm.nombre" type="text" class="input-field" required />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label text-rose-900">Expediente</label>
              <input v-model="patientForm.expediente" type="text" maxlength="4" class="input-field" placeholder="001 o 0001" />
            </div>
            <div>
              <label class="label text-rose-900">Teléfono</label>
              <input v-model="patientForm.telefono" type="tel" maxlength="10" class="input-field" placeholder="10 dígitos" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label text-rose-900">Edad</label>
              <input v-model.number="patientForm.edad" type="number" min="0" max="150" class="input-field" />
            </div>
            <div>
              <label class="label text-rose-900">Sexo</label>
              <select v-model="patientForm.sexo" class="input-field">
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
          <p v-if="patientError" class="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">{{ patientError }}</p>
          <div class="flex gap-2">
            <button type="button" class="btn-secondary btn-sm flex-1" :disabled="patientSaving" @click="editingPatient = false">Cancelar</button>
            <button type="submit" class="btn-primary btn-sm flex-1" :disabled="patientSaving">
              {{ patientSaving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
        <button type="button" class="btn-secondary mt-2 flex w-full justify-center" @click="showPatientRecord = true">
          Ver expediente
        </button>
      </aside>
      </div>
    </template>
  </div>
  <FormModal v-model="showEditAppointment">
    <AppointmentFormView
      modal
      :appointment-id="appointment?.id"
      @close="showEditAppointment = false"
      @saved="handleAppointmentSaved"
    />
  </FormModal>
  <FormModal v-model="showPatientRecord">
    <PatientExpedienteView modal :patient-id="appointment?.patientId" />
  </FormModal>
  <FormModal v-model="showNewNote">
    <SessionNoteFormView
      modal
      :initial-patient-id="appointment?.patientId"
      :initial-appointment-id="appointment?.id"
      @close="showNewNote = false"
      @saved="handleNoteSaved"
    />
  </FormModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { appointmentsService } from '../../services/appointments.service'
import { patientsService } from '../../services/patients.service'
import type { Appointment, AppointmentStatus, Patient } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { useFormatters } from '../../composables/useFormatters'
import { useNotification } from '../../composables/useNotification'
import FormModal from '../../components/FormModal.vue'
import SessionNoteFormView from '../sessionNotes/SessionNoteFormView.vue'
import AppointmentFormView from './AppointmentFormView.vue'
import PatientExpedienteView from '../patients/PatientExpedienteView.vue'

const router = useRouter()
const route = useRoute()
const { formatDate, formatTime } = useFormatters()
const { success, error } = useNotification()
const props = defineProps<{ modal?: boolean; appointmentId?: number }>()

const appointment = ref<Appointment | null>(null)
const loading = ref(true)
const editingPatient = ref(false)
const patientSaving = ref(false)
const patientError = ref('')
const patientForm = ref({
  expediente: '',
  nombre: '',
  telefono: '',
  edad: 0,
  sexo: 'Otro',
})
const showNewNote = ref(false)
const showEditAppointment = ref(false)
const showPatientRecord = ref(false)
const statuses: AppointmentStatus[] = ['Programada', 'Atendida', 'No asistió']
const detailId = () => props.appointmentId || (route.params.id ? Number(route.params.id) : 0)

function startPatientEdit() {
  if (!appointment.value?.patient) return
  const patient = appointment.value.patient
  patientForm.value = {
    expediente: patient.expediente || '',
    nombre: patient.nombre,
    telefono: patient.telefono || '',
    edad: patient.edad ?? 0,
    sexo: patient.sexo || 'Otro',
  }
  patientError.value = ''
  editingPatient.value = true
}

async function savePatient() {
  if (!appointment.value?.patient) return
  const expediente = patientForm.value.expediente.trim()
  const telefono = patientForm.value.telefono.trim()
  if (!patientForm.value.nombre.trim()) {
    patientError.value = 'El nombre es obligatorio'
    return
  }
  if (expediente && !/^\d{3,4}$/.test(expediente)) {
    patientError.value = 'El expediente debe tener 3 o 4 dígitos'
    return
  }
  if (telefono && !/^\d{10}$/.test(telefono)) {
    patientError.value = 'El teléfono debe tener 10 dígitos'
    return
  }
  patientSaving.value = true
  patientError.value = ''
  try {
    const response = await patientsService.update(appointment.value.patientId, {
      ...patientForm.value,
      expediente,
      telefono,
      nombre: patientForm.value.nombre.trim(),
    })
    appointment.value.patient = response.data as Patient
    editingPatient.value = false
    success('Paciente actualizado correctamente')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    patientError.value = e.response?.data?.message || 'No se pudo actualizar el paciente'
  } finally {
    patientSaving.value = false
  }
}

async function changeStatus(estado: AppointmentStatus) {
  try {
    await appointmentsService.changeStatus(Number(route.params.id), estado)
    if (appointment.value) appointment.value.estado = estado
    success('Estado actualizado')
  } catch { error('Error al cambiar estado') }
}

function handleNoteSaved() {
  showNewNote.value = false
}

async function handleAppointmentSaved() {
  showEditAppointment.value = false
  const response = await appointmentsService.getById(detailId())
  appointment.value = response.data
}

onMounted(async () => {
  try {
    const response = await appointmentsService.getById(detailId())
    appointment.value = response.data
  } catch { router.push('/appointments') } finally { loading.value = false }
})
</script>
