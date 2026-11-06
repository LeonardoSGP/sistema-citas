<template>
  <div class="max-w-4xl rounded-[2rem] bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50" :class="modal ? 'p-2 sm:p-3' : 'p-4 sm:p-6'">
    <div class="flex items-center gap-3 rounded-[1.5rem] border border-rose-100 bg-rose-100/70 p-4 shadow-sm" :class="modal ? 'mb-3' : 'mb-6'">
      <button v-if="!modal" @click="router.back()" class="rounded-xl p-2 text-rose-700 transition hover:bg-rose-200/70 hover:text-primary-800">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h2 class="text-xl font-semibold text-primary-900">{{ isEdit ? 'Editar Cita' : 'Nueva Cita' }}</h2>
        <p class="mt-1 text-sm text-rose-700">Programa y organiza los detalles de la consulta.</p>
      </div>
    </div>

    <div class="card border-rose-100 bg-fuchsia-50/80 shadow-[0_10px_35px_-12px_rgba(225,29,72,0.2)]" :class="modal ? 'p-4 sm:p-5' : ''">
      <form @submit.prevent="handleSubmit" :class="modal ? 'space-y-4' : 'space-y-6'">
        <div>
          <div class="mb-1 flex items-center justify-between gap-3">
            <label class="label mb-0 text-rose-900">Paciente</label>
            <button
              v-if="!isEdit"
              type="button"
              class="text-xs font-semibold text-primary-600 transition hover:text-primary-800"
              @click="showNewPatient = true"
            >
              + Nuevo paciente
            </button>
          </div>
          <div class="relative">
            <input
              v-model="patientSearch"
              type="search"
              class="input-field"
              :class="{'border-red-500 ring-4 ring-red-50': errors.patientId}"
              placeholder="Escribe el nombre del paciente"
              autocomplete="off"
              @focus="showPatientResults = true"
              @input="handlePatientSearch"
            />
            <div
              v-if="showPatientResults && patientSearch.trim()"
              class="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-rose-200 bg-white shadow-lg"
            >
              <button
                v-for="patient in filteredPatients"
                :key="patient.id"
                type="button"
                class="block w-full border-b border-rose-100 px-4 py-3 text-left last:border-0 hover:bg-rose-50"
                @mousedown.prevent="selectPatient(patient)"
              >
                <span class="block text-sm font-medium text-primary-900">{{ patient.nombre }}</span>
                <span class="block text-xs text-rose-600">
                  Exp. {{ patient.expediente || 'Sin expediente' }} · {{ patient.edad }} años
                </span>
              </button>
              <p v-if="!filteredPatients.length" class="px-4 py-3 text-sm text-rose-700">
                No se encontró ese paciente.
              </p>
            </div>
          </div>
          <p v-if="form.patientId && selectedPatient" class="mt-1 text-xs text-emerald-700">
            Paciente seleccionado: {{ selectedPatient.nombre }}
          </p>
          <p v-if="errors.patientId" class="text-red-500 text-xs mt-1">{{ errors.patientId }}</p>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label class="label text-rose-900">Fecha</label>
          <input v-model="form.fecha" type="date" class="input-field" :class="{'border-red-500 ring-4 ring-red-50': errors.fecha}" />
          <p v-if="errors.fecha" class="text-red-500 text-xs mt-1">{{ errors.fecha }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label text-rose-900">Hora inicio</label>
            <select v-model="form.horaInicio" class="input-field" :class="{'border-red-500 ring-4 ring-red-50': errors.horaInicio}" @change="setEndTimeFromStart">
              <option value="">Elegir hora</option>
              <option v-for="hour in startHours" :key="hour" :value="hour">{{ hour }}</option>
            </select>
            <p v-if="errors.horaInicio" class="text-red-500 text-xs mt-1">{{ errors.horaInicio }}</p>
          </div>
          <div>
            <label class="label text-rose-900">Hora fin</label>
            <select v-model="form.horaFin" class="input-field" :class="{'border-red-500 ring-4 ring-red-50': errors.horaFin}">
              <option value="">Elegir hora</option>
              <option v-for="hour in endHours" :key="hour" :value="hour">{{ hour }}</option>
            </select>
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
          <button type="button" @click="cancelForm" class="btn-secondary btn-sm sm:min-w-28">Cancelar</button>
          <button type="submit" class="btn-primary btn-sm sm:min-w-32" :disabled="loading">
            {{ loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Cita') }}
          </button>
        </div>
      </form>
    </div>
  </div>
  <FormModal v-model="showNewPatient">
    <PatientFormView modal @close="showNewPatient = false" @saved="handleNewPatientSaved" />
  </FormModal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { appointmentsService } from '../../services/appointments.service'
import { patientsService } from '../../services/patients.service'
import type { Patient, AppointmentStatus } from '../../types'
import { useNotification } from '../../composables/useNotification'
import FormModal from '../../components/FormModal.vue'
import PatientFormView from '../patients/PatientFormView.vue'

const router = useRouter()
const route = useRoute()
const { success, error } = useNotification()
const props = defineProps<{ modal?: boolean; appointmentId?: number; initialPatientId?: number; initialDate?: string }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const editId = computed(() => props.appointmentId || (!props.modal && route.params.id ? Number(route.params.id) : 0))
const isEdit = computed(() => editId.value > 0)
const loading = ref(false)
const serverError = ref('')
const patients = ref<Patient[]>([])
const patientSearch = ref('')
const showPatientResults = ref(false)
const showNewPatient = ref(false)
const startHours = Array.from({ length: 6 }, (_, index) => `${String(index + 8).padStart(2, '0')}:00`)
const endHours = Array.from({ length: 7 }, (_, index) => `${String(index + 8).padStart(2, '0')}:00`)

const filteredPatients = computed(() => {
  const query = patientSearch.value.trim().toLocaleLowerCase('es')
  if (!query) return []
  return patients.value
    .filter((patient) =>
      patient.nombre.toLocaleLowerCase('es').includes(query) ||
      (patient.expediente || '').includes(query) ||
      (patient.telefono || '').includes(query)
    )
    .slice(0, 10)
})

const selectedPatient = computed(() =>
  patients.value.find((patient) => patient.id === form.patientId) || null
)

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

function setEndTimeFromStart() {
  if (!form.horaInicio) return
  const [hours, minutes] = form.horaInicio.split(':').map(Number)
  const endHours = Math.min(hours + 1, 14)
  form.horaFin = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

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
  if (form.horaInicio && !form.horaInicio.endsWith(':00')) {
    errors.horaInicio = 'Selecciona una hora completa'
    valid = false
  }
  if (form.horaFin && !form.horaFin.endsWith(':00')) {
    errors.horaFin = 'Selecciona una hora completa'
    valid = false
  }
  return valid
}

function handlePatientSearch() {
  form.patientId = 0
  showPatientResults.value = true
  errors.patientId = ''
}

function selectPatient(patient: Patient) {
  form.patientId = patient.id
  patientSearch.value = patient.nombre
  showPatientResults.value = false
  errors.patientId = ''
}

function handleNewPatientSaved(patient: Patient) {
  patients.value = [patient, ...patients.value.filter((item) => item.id !== patient.id)]
  selectPatient(patient)
  showNewPatient.value = false
}

async function handleSubmit() {
  if (!validate()) return
  loading.value = true
  serverError.value = ''
  try {
    if (isEdit.value) {
      await appointmentsService.update(editId.value, form)
      success('Cita actualizada correctamente')
    } else {
      await appointmentsService.create(form)
      success('Cita creada correctamente')
    }
    if (props.modal) emit('saved')
    else await router.replace({ path: '/appointments', query: { refreshed: String(Date.now()) } })
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    serverError.value = e.response?.data?.message || 'Error al guardar la cita'
    error(serverError.value)
  } finally {
    loading.value = false
  }
}

function cancelForm() {
  if (props.modal) emit('close')
  else router.back()
}

onMounted(async () => {
  try {
    const pResponse = await patientsService.getAll()
    patients.value = pResponse.data

    // Pre-select patient if passed via query
    if (props.initialPatientId || route.query.patientId) {
      form.patientId = props.initialPatientId || Number(route.query.patientId)
      const patient = patients.value.find((item) => item.id === form.patientId)
      if (patient) patientSearch.value = patient.nombre
    }
    if (props.initialDate || route.query.date) form.fecha = props.initialDate || String(route.query.date)

    if (isEdit.value) {
      const aResponse = await appointmentsService.getById(editId.value)
      const appt = aResponse.data
      form.patientId = appt.patientId
      const patient = patients.value.find((item) => item.id === form.patientId)
      if (patient) patientSearch.value = patient.nombre
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
