<template>
  <div class="max-w-6xl" :class="modal ? 'space-y-4 rounded-[2rem] bg-slate-50/95 p-3 sm:p-5' : 'space-y-6'">
    <div v-if="!modal" class="flex items-center gap-3">
      <button v-if="!modal" @click="router.back()" class="p-2 rounded-lg hover:bg-slate-200">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 class="text-xl font-semibold text-slate-900">Detalle de Cita</h2>
    </div>

    <LoadingSpinner v-if="loading" />

    <template v-else-if="appointment">
      <div class="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
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

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" class="btn-secondary" @click="showEditAppointment = true">Editar cita</button>
          <button type="button" class="btn-primary" @click="showNewNote = true">+ Nota de sesión</button>
          <button type="button" class="btn-secondary border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700" @click="showDeletePrompt = true">
            Eliminar cita
          </button>
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
  <FormModal v-model="showPatientRecord" size="wide">
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
  <FormModal v-model="showNextAppointmentPrompt">
    <div class="rounded-[2rem] bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-5 sm:p-7">
      <div class="rounded-[1.5rem] border border-rose-100 bg-white/80 p-5 text-center shadow-sm">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6"/></svg>
        </div>
        <h3 class="mt-4 text-lg font-semibold text-slate-900">Cita marcada como atendida</h3>
        <p class="mt-2 text-sm text-slate-600">¿Quieres agendar la próxima cita para <strong>{{ appointment?.patient?.nombre }}</strong>?</p>
        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <button type="button" class="btn-secondary btn-sm" @click="showNextAppointmentPrompt = false">Ahora no</button>
          <button type="button" class="btn-primary btn-sm" @click="scheduleNextAppointment">Agendar próxima cita</button>
        </div>
      </div>
    </div>
  </FormModal>
  <FormModal v-model="showReschedulePrompt">
    <div class="rounded-[2rem] bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-5 sm:p-7">
      <div class="rounded-[1.5rem] border border-rose-100 bg-white/80 p-5 text-center shadow-sm">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M7 3v4M17 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v12H4V7a2 2 0 0 1 2-2Z"/><path stroke-linecap="round" d="M12 12v3l2 1"/></svg>
        </div>
        <h3 class="mt-4 text-lg font-semibold text-slate-900">Cita marcada como no asistida</h3>
        <p class="mt-2 text-sm text-slate-600">¿Quieres reprogramar la cita de <strong>{{ appointment?.patient?.nombre }}</strong>?</p>
        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <button type="button" class="btn-secondary btn-sm" @click="showReschedulePrompt = false">Ahora no</button>
          <button type="button" class="btn-primary btn-sm" @click="showReschedulePrompt = false; showReschedule = true">Reprogramar cita</button>
        </div>
      </div>
    </div>
  </FormModal>
  <FormModal v-model="showReschedule">
    <div class="rounded-[2rem] bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-5 sm:p-7">
      <div class="rounded-[1.5rem] border border-rose-100 bg-white/80 p-5 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900">Reprogramar cita</h3>
        <p class="mt-1 text-sm text-slate-600">{{ appointment?.patient?.nombre }}</p>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <input v-model="rescheduleForm.fecha" type="date" class="input-field" />
          <select v-model="rescheduleForm.horaInicio" class="input-field" @change="setRescheduleEndTime"><option value="">Elegir hora</option><option v-for="hour in startHours" :key="hour" :value="hour">{{ hour }}</option></select>
          <select v-model="rescheduleForm.horaFin" class="input-field"><option value="">Elegir hora</option><option v-for="hour in endHours" :key="hour" :value="hour">{{ hour }}</option></select>
        </div>
        <p v-if="rescheduleError" class="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">{{ rescheduleError }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="btn-secondary btn-sm" @click="showReschedule = false">Cancelar</button>
          <button type="button" class="btn-primary btn-sm" :disabled="rescheduleLoading" @click="submitReschedule">
            {{ rescheduleLoading ? 'Guardando...' : (appointment?.estado === 'Programada' ? 'Guardar cambios' : 'Crear nueva cita') }}
          </button>
        </div>
      </div>
    </div>
  </FormModal>
  <FormModal v-model="showDeletePrompt">
    <div class="rounded-[2rem] bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 p-5 sm:p-7">
      <div class="rounded-[1.5rem] border border-red-100 bg-white/80 p-5 text-center shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900">¿Eliminar esta cita?</h3>
        <p class="mt-2 text-sm text-slate-600">
          Se eliminará la cita de <strong>{{ appointment?.patient?.nombre }}</strong>. Sus notas de sesión se conservarán.
        </p>
        <p v-if="deleteError" class="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">{{ deleteError }}</p>
        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <button type="button" class="btn-secondary btn-sm" @click="showDeletePrompt = false">Cancelar</button>
          <button type="button" class="btn-sm rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50" :disabled="deleteLoading" @click="deleteAppointment">
            {{ deleteLoading ? 'Eliminando...' : 'Sí, eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </FormModal>
  <FormModal v-model="showNextAppointment">
    <AppointmentFormView
      modal
      :initial-patient-id="appointment?.patientId"
      @close="showNextAppointment = false"
      @saved="showNextAppointment = false"
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
const emit = defineEmits<{ deleted: [] }>()

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
const showNextAppointmentPrompt = ref(false)
const showNextAppointment = ref(false)
const showReschedulePrompt = ref(false)
const showReschedule = ref(false)
const showDeletePrompt = ref(false)
const deleteLoading = ref(false)
const deleteError = ref('')
const rescheduleLoading = ref(false)
const rescheduleError = ref('')
const rescheduleForm = ref({ fecha: '', horaInicio: '', horaFin: '' })
const startHours = Array.from({ length: 6 }, (_, index) => `${String(index + 8).padStart(2, '0')}:00`)
const endHours = Array.from({ length: 7 }, (_, index) => `${String(index + 8).padStart(2, '0')}:00`)
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

function scheduleNextAppointment() {
  showNextAppointmentPrompt.value = false
  showNextAppointment.value = true
}

function setRescheduleEndTime() {
  if (!rescheduleForm.value.horaInicio) return
  const hour = Number(rescheduleForm.value.horaInicio.slice(0, 2))
  rescheduleForm.value.horaFin = `${String(Math.min(hour + 1, 14)).padStart(2, '0')}:00`
}

async function submitReschedule() {
  if (!appointment.value) return
  if (!rescheduleForm.value.fecha || !rescheduleForm.value.horaInicio || !rescheduleForm.value.horaFin) {
    rescheduleError.value = 'Completa fecha y horario'
    return
  }
  rescheduleLoading.value = true
  rescheduleError.value = ''
  try {
    if (appointment.value.estado === 'Programada') {
      await appointmentsService.reschedule(detailId(), rescheduleForm.value)
      success('Cita reprogramada correctamente')
    } else {
      await appointmentsService.create({
        patientId: appointment.value.patientId,
        ...rescheduleForm.value,
        estado: 'Programada',
        motivo: appointment.value.motivo || undefined,
        observaciones: appointment.value.observaciones || undefined,
      })
      success('Nueva cita programada correctamente')
    }
    showReschedule.value = false
    if (appointment.value.estado === 'Programada') {
      const response = await appointmentsService.getById(detailId())
      appointment.value = response.data
    }
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    rescheduleError.value = e.response?.data?.message || 'No se pudo reprogramar la cita'
  } finally {
    rescheduleLoading.value = false
  }
}

async function deleteAppointment() {
  if (!appointment.value) return
  deleteLoading.value = true
  deleteError.value = ''
  try {
    await appointmentsService.delete(detailId())
    success('Cita eliminada correctamente')
    showDeletePrompt.value = false
    if (props.modal) emit('deleted')
    else await router.replace('/appointments')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    deleteError.value = e.response?.data?.message || 'No se pudo eliminar la cita'
  } finally {
    deleteLoading.value = false
  }
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
    await appointmentsService.changeStatus(detailId(), estado)
    if (appointment.value) appointment.value.estado = estado
    success('Estado actualizado')
    if (estado === 'Atendida') showNextAppointmentPrompt.value = true
    if (estado === 'No asistió') {
      rescheduleForm.value = {
        fecha: appointment.value?.fecha.substring(0, 10) || '',
        horaInicio: appointment.value?.horaInicio.substring(11, 16) || '',
        horaFin: appointment.value?.horaFin.substring(11, 16) || '',
      }
      showReschedulePrompt.value = true
    }
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
