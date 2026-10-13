<template>
  <div class="min-w-0 space-y-5 overflow-x-hidden rounded-[2rem] bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-3 sm:p-4">
    <div class="flex flex-col gap-4 rounded-[1.75rem] border border-rose-100 bg-rose-100/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap gap-3">
        <div class="relative w-full sm:w-80">
          <input
            v-model="patientSearch"
            type="text"
            class="input-field border-rose-200 bg-rose-50/80 text-rose-950"
            placeholder="Buscar paciente"
            @focus="showPatientResults = true"
            @input="handlePatientSearch"
          />
          <button
            v-if="filterPatientId || patientSearch"
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-rose-400 hover:text-primary-700"
            aria-label="Limpiar paciente"
            @click="clearPatientFilter"
          >×</button>
          <div
            v-if="showPatientResults && patientSearch && filteredPatients.length"
            class="absolute z-10 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-rose-200 bg-rose-50 shadow-lg"
          >
            <button
              v-for="patient in filteredPatients"
              :key="patient.id"
              type="button"
              class="block w-full px-4 py-3 text-left text-sm text-rose-900 hover:bg-rose-100"
              @click="selectPatient(patient)"
            >
              <span class="font-medium">{{ patient.nombre }}</span>
              <span class="ml-2 text-xs text-primary-600">Exp. {{ patient.expediente }}</span>
            </button>
          </div>
          <p v-if="showPatientResults && patientSearch && !filteredPatients.length" class="absolute z-10 mt-2 w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-lg">
            No se encontró ese paciente
          </p>
        </div>
        <select v-model="filterEstado" class="input-field w-full border-rose-200 bg-rose-50/80 text-rose-950 sm:w-56" @change="applyFilters">
          <option value="">Todos los estados</option>
          <option value="Programada">Programada</option>
          <option value="Atendida">Atendida</option>
          <option value="No asistió">No asistió</option>
        </select>
        <input v-model="filterFecha" type="date" class="input-field w-full border-rose-200 bg-rose-50/80 text-rose-950 sm:w-auto" @change="applyFilters" />
        <button v-if="filterEstado || filterFecha" @click="clearFilters" class="btn-secondary btn-sm border-rose-200 bg-rose-50 text-primary-700 hover:bg-rose-100">Limpiar</button>
      </div>
      <RouterLink to="/appointments/new" class="btn-primary whitespace-nowrap">+ Nueva Cita</RouterLink>
    </div>

    <!-- Tabs -->
    <div class="flex w-fit gap-1 rounded-2xl border border-rose-100 bg-rose-100/70 p-1">
      <button
        @click="activeTab = 'all'; loadAppointments()"
        class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
        :class="activeTab === 'all' ? 'bg-rose-50 shadow text-primary-800' : 'text-rose-700 hover:text-primary-900'"
      >Todas</button>
      <button
        @click="activeTab = 'today'; loadToday()"
        class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
        :class="activeTab === 'today' ? 'bg-rose-50 shadow text-primary-800' : 'text-rose-700 hover:text-primary-900'"
      >Hoy</button>
      <button
        @click="activeTab = 'week'; loadWeek()"
        class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
        :class="activeTab === 'week' ? 'bg-rose-50 shadow text-primary-800' : 'text-rose-700 hover:text-primary-900'"
      >Esta semana</button>
    </div>

    <div class="card overflow-hidden border-rose-100 bg-fuchsia-50/80 p-0 shadow-[0_10px_35px_-12px_rgba(225,29,72,0.25)]">
      <LoadingSpinner v-if="loading" />
      <EmptyState v-else-if="!appointments.length" title="Sin citas" description="No hay citas que mostrar" >
        <RouterLink
          :to="{
            path: '/appointments/new',
            query: filterPatientId ? { patientId: String(filterPatientId) } : undefined,
          }"
          class="btn-primary"
        >Crear primera cita</RouterLink>
      </EmptyState>
      <div v-else>
        <!-- Desktop -->
        <table class="hidden w-full table-fixed md:table">
          <thead>
            <tr class="border-b border-rose-200 bg-rose-100/80">
              <th class="w-[13%] px-3 py-3 text-left text-xs font-semibold uppercase text-primary-800">Fecha</th>
              <th class="w-[18%] px-3 py-3 text-left text-xs font-semibold uppercase text-primary-800">Hora</th>
              <th class="w-[23%] px-3 py-3 text-left text-xs font-semibold uppercase text-primary-800">Paciente</th>
              <th class="w-[15%] px-3 py-3 text-left text-xs font-semibold uppercase text-primary-800">Estado</th>
              <th class="w-[15%] px-3 py-3 text-left text-xs font-semibold uppercase text-primary-800">Motivo</th>
              <th class="w-[16%] px-3 py-3 text-left text-xs font-semibold uppercase text-primary-800">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-rose-100">
            <tr v-for="appt in appointments" :key="appt.id" class="hover:bg-rose-100/60">
              <td class="truncate px-3 py-3 text-sm text-rose-800">{{ formatShortDate(appt.fecha) }}</td>
              <td class="truncate px-3 py-3 text-sm text-rose-800">{{ formatTime(appt.horaInicio) }} - {{ formatTime(appt.horaFin) }}</td>
              <td class="px-3 py-3">
                <p class="truncate text-sm font-medium text-rose-950">{{ appt.patient?.nombre }}</p>
                <p class="font-mono text-xs text-primary-700">{{ appt.patient?.expediente }}</p>
              </td>
              <td class="px-3 py-3"><StatusBadge :status="appt.estado" /></td>
              <td class="truncate px-3 py-3 text-sm text-rose-800">{{ appt.motivo || '-' }}</td>
              <td class="px-3 py-3">
                <div class="flex flex-wrap gap-x-2 gap-y-1">
                  <template v-if="appt.estado === 'Programada'">
                    <button
                      type="button"
                      class="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="statusLoading[appt.id]"
                      @click="markAttendance(appt, 'Atendida')"
                    >{{ statusLoading[appt.id] ? 'Guardando...' : 'Asistió' }}</button>
                    <button
                      type="button"
                      class="text-sm font-medium text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="statusLoading[appt.id]"
                      @click="markAttendance(appt, 'No asistió')"
                    >No asistió</button>
                  </template>
                  <RouterLink :to="`/appointments/${appt.id}`" class="text-sm text-primary-600 hover:text-primary-700">Ver</RouterLink>
                  <RouterLink :to="`/appointments/${appt.id}/edit`" class="text-sm text-rose-700 hover:text-primary-900">Editar</RouterLink>
                  <button
                    v-if="appt.estado === 'Programada'"
                    @click="openReschedule(appt)"
                    class="text-sm text-amber-600 hover:text-amber-700"
                  >Re-programar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Mobile -->
        <div class="divide-y divide-rose-100 md:hidden">
          <div v-for="appt in appointments" :key="appt.id" class="p-4 hover:bg-rose-100/60">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-medium text-rose-950">{{ appt.patient?.nombre }}</p>
                <p class="text-sm text-rose-800">{{ formatShortDate(appt.fecha) }} · {{ formatTime(appt.horaInicio) }}</p>
              </div>
              <StatusBadge :status="appt.estado" />
            </div>
            <div class="flex gap-3 mt-3">
              <template v-if="appt.estado === 'Programada'">
                <button
                  type="button"
                  class="btn-sm text-xs font-medium text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="statusLoading[appt.id]"
                  @click="markAttendance(appt, 'Atendida')"
                >{{ statusLoading[appt.id] ? 'Guardando...' : 'Asistió' }}</button>
                <button
                  type="button"
                  class="btn-sm text-xs font-medium text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="statusLoading[appt.id]"
                  @click="markAttendance(appt, 'No asistió')"
                >No asistió</button>
              </template>
              <RouterLink :to="`/appointments/${appt.id}`" class="btn-secondary btn-sm text-xs">Ver</RouterLink>
              <RouterLink :to="`/appointments/${appt.id}/edit`" class="btn-secondary btn-sm text-xs">Editar</RouterLink>
              <button
                v-if="appt.estado === 'Programada'"
                @click="openReschedule(appt)"
                class="btn-sm text-xs text-amber-600"
              >Re-programar</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="appointments.length" class="flex flex-col gap-3 border-t border-rose-100 bg-rose-100/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-rose-800">Página {{ currentPage }} de {{ totalPages }} · {{ totalAppointments }} citas</p>
        <div class="flex items-center gap-2">
          <button type="button" class="btn-secondary btn-sm border-rose-200 bg-rose-50 text-primary-700 disabled:cursor-not-allowed disabled:opacity-40" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
            <span aria-hidden="true">←</span> Anterior
          </button>
          <button type="button" class="btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-40" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
            Siguiente <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Reschedule Modal -->
    <Teleport to="body">
      <div v-if="showRescheduleModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Re-programar Cita</h3>
          <p class="text-sm text-slate-600 mb-4">Paciente: <strong>{{ rescheduleAppt?.patient?.nombre }}</strong></p>
          <div class="space-y-3">
            <div>
              <label class="label">Nueva fecha</label>
              <input v-model="rescheduleForm.fecha" type="date" class="input-field" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Hora inicio</label>
                <input v-model="rescheduleForm.horaInicio" type="time" min="08:00" max="14:00" class="input-field" @change="setRescheduleEndTime" />
              </div>
              <div>
                <label class="label">Hora fin</label>
                <input v-model="rescheduleForm.horaFin" type="time" min="08:00" max="14:00" class="input-field" />
              </div>
            </div>
          </div>
          <div v-if="rescheduleError" class="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
            <p class="text-red-700 text-sm">{{ rescheduleError }}</p>
          </div>
          <div class="flex gap-3 mt-4">
            <button @click="closeReschedule" class="btn-secondary flex-1">Cancelar</button>
            <button @click="submitReschedule" class="btn-primary flex-1" :disabled="rescheduleLoading">
              {{ rescheduleLoading ? 'Guardando...' : 'Re-programar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { appointmentsService } from '../../services/appointments.service'
import { patientsService } from '../../services/patients.service'
import type { Appointment, Patient } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { useFormatters } from '../../composables/useFormatters'
import { useNotification } from '../../composables/useNotification'

const { formatShortDate, formatTime } = useFormatters()
const { success, error } = useNotification()
const allAppointments = ref<Appointment[]>([])
const loading = ref(true)
const activeTab = ref('all')
const filterEstado = ref('')
const filterFecha = ref('')
const filterPatientId = ref(0)
const patientSearch = ref('')
const patients = ref<Patient[]>([])
const showPatientResults = ref(false)
const statusLoading = ref<Record<number, boolean>>({})
const currentPage = ref(1)
const pageSize = 5
const appointments = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return allAppointments.value.slice(start, start + pageSize)
})
const totalAppointments = computed(() => allAppointments.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalAppointments.value / pageSize)))
const filteredPatients = computed(() => {
  const query = patientSearch.value.trim().toLowerCase()
  if (!query) return patients.value
  return patients.value.filter((patient) =>
    patient.nombre.toLowerCase().includes(query) ||
    (patient.expediente || '').toLowerCase().includes(query)
  )
})

// Reschedule modal state
const showRescheduleModal = ref(false)
const rescheduleAppt = ref<Appointment | null>(null)
const rescheduleLoading = ref(false)
const rescheduleError = ref('')
const rescheduleForm = ref({ fecha: '', horaInicio: '', horaFin: '' })

function openReschedule(appt: Appointment) {
  rescheduleAppt.value = appt
  rescheduleForm.value = {
    fecha: appt.fecha.substring(0, 10),
    horaInicio: typeof appt.horaInicio === 'string' ? appt.horaInicio.substring(11, 16) : '',
    horaFin: typeof appt.horaFin === 'string' ? appt.horaFin.substring(11, 16) : '',
  }
  rescheduleError.value = ''
  showRescheduleModal.value = true
}

function closeReschedule() {
  showRescheduleModal.value = false
  rescheduleAppt.value = null
}

function setRescheduleEndTime() {
  if (!rescheduleForm.value.horaInicio) return
  const [hours, minutes] = rescheduleForm.value.horaInicio.split(':').map(Number)
  const endHours = Math.min(hours + 1, 14)
  rescheduleForm.value.horaFin = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

async function submitReschedule() {
  if (!rescheduleAppt.value) return
  if (!rescheduleForm.value.fecha || !rescheduleForm.value.horaInicio || !rescheduleForm.value.horaFin) {
    rescheduleError.value = 'Todos los campos son obligatorios'
    return
  }
  if (rescheduleForm.value.horaFin <= rescheduleForm.value.horaInicio) {
    rescheduleError.value = 'La hora de fin debe ser posterior a la hora de inicio'
    return
  }
  if (rescheduleForm.value.horaInicio < '08:00') {
    rescheduleError.value = 'Las citas deben iniciar a partir de las 08:00'
    return
  }
  if (rescheduleForm.value.horaFin > '14:00') {
    rescheduleError.value = 'Las citas deben terminar a más tardar a las 14:00'
    return
  }
  rescheduleLoading.value = true
  rescheduleError.value = ''
  try {
    await appointmentsService.reschedule(rescheduleAppt.value.id, rescheduleForm.value)
    success('Cita re-programada correctamente')
    closeReschedule()
    if (activeTab.value === 'today') await loadToday()
    else if (activeTab.value === 'week') await loadWeek()
    else await loadAppointments()
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    rescheduleError.value = e.response?.data?.message || 'Error al re-programar la cita'
  } finally {
    rescheduleLoading.value = false
  }
}

async function loadAppointments() {
  activeTab.value = 'all'
  currentPage.value = 1
  loading.value = true
  try {
    const params: { estado?: string; fecha?: string; patientId?: number } = {}
    if (filterEstado.value) params.estado = filterEstado.value
    if (filterFecha.value) params.fecha = filterFecha.value
    if (filterPatientId.value) params.patientId = filterPatientId.value
    const response = await appointmentsService.getAll(params)
    allAppointments.value = response.data
  } catch { error('Error al cargar citas') } finally { loading.value = false }
}

async function loadToday() {
  activeTab.value = 'today'
  currentPage.value = 1
  loading.value = true
  try {
    const response = await appointmentsService.getToday()
    allAppointments.value = response.data
  } catch { error('Error al cargar citas') } finally { loading.value = false }
}

async function loadWeek() {
  activeTab.value = 'week'
  currentPage.value = 1
  loading.value = true
  try {
    const response = await appointmentsService.getWeek()
    allAppointments.value = response.data
  } catch { error('Error al cargar citas') } finally { loading.value = false }
}

function clearFilters() {
  filterEstado.value = ''
  filterFecha.value = ''
  clearPatientFilter()
  return
}

function applyFilters() {
  loadAppointments()
}

function handlePatientSearch() {
  filterPatientId.value = 0
  showPatientResults.value = true
}

function selectPatient(patient: Patient) {
  filterPatientId.value = patient.id
  patientSearch.value = patient.nombre
  showPatientResults.value = false
  loadAppointments()
}

function clearPatientFilter() {
  filterPatientId.value = 0
  patientSearch.value = ''
  showPatientResults.value = false
  loadAppointments()
}

async function markAttendance(appointment: Appointment, status: 'Atendida' | 'No asistió') {
  statusLoading.value[appointment.id] = true
  try {
    const response = await appointmentsService.changeStatus(appointment.id, status)
    appointment.estado = response.data.estado
    success(status === 'Atendida' ? 'Cita marcada como atendida' : 'Cita marcada como no asistida')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    error(e.response?.data?.message || 'No se pudo actualizar el estado de la cita')
  } finally {
    statusLoading.value[appointment.id] = false
  }
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

onMounted(async () => {
  try {
    const response = await patientsService.getAll({ activo: true })
    patients.value = response.data
  } catch { /* ignore */ }
  await loadAppointments()
})
</script>
