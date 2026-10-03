<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div class="flex flex-wrap gap-3">
        <select v-model="filterEstado" class="input-field w-auto" @change="loadAppointments">
          <option value="">Todos los estados</option>
          <option value="Programada">Programada</option>
          <option value="Confirmada">Confirmada</option>
          <option value="Atendida">Atendida</option>
          <option value="Cancelada">Cancelada</option>
          <option value="No asistió">No asistió</option>
        </select>
        <input v-model="filterFecha" type="date" class="input-field w-auto" @change="loadAppointments" />
        <button v-if="filterEstado || filterFecha" @click="clearFilters" class="btn-secondary btn-sm">Limpiar</button>
      </div>
      <RouterLink to="/appointments/new" class="btn-primary whitespace-nowrap">+ Nueva Cita</RouterLink>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
      <button
        @click="activeTab = 'all'; loadAppointments()"
        class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
        :class="activeTab === 'all' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'"
      >Todas</button>
      <button
        @click="activeTab = 'today'; loadToday()"
        class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
        :class="activeTab === 'today' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'"
      >Hoy</button>
      <button
        @click="activeTab = 'week'; loadWeek()"
        class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
        :class="activeTab === 'week' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'"
      >Esta semana</button>
    </div>

    <div class="card p-0 overflow-hidden">
      <LoadingSpinner v-if="loading" />
      <EmptyState v-else-if="!appointments.length" title="Sin citas" description="No hay citas que mostrar" >
        <RouterLink to="/appointments/new" class="btn-primary">Crear primera cita</RouterLink>
      </EmptyState>
      <div v-else>
        <!-- Desktop -->
        <table class="w-full hidden md:table">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50">
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Hora</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Paciente</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Motivo</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="appt in appointments" :key="appt.id" class="hover:bg-slate-50">
              <td class="px-6 py-4 text-sm text-slate-700">{{ formatShortDate(appt.fecha) }}</td>
              <td class="px-6 py-4 text-sm text-slate-700">{{ formatTime(appt.horaInicio) }} - {{ formatTime(appt.horaFin) }}</td>
              <td class="px-6 py-4">
                <p class="text-sm font-medium text-slate-900">{{ appt.patient?.nombre }}</p>
                <p class="text-xs text-slate-500 font-mono">{{ appt.patient?.expediente }}</p>
              </td>
              <td class="px-6 py-4"><StatusBadge :status="appt.estado" /></td>
              <td class="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{{ appt.motivo || '-' }}</td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <RouterLink :to="`/appointments/${appt.id}`" class="text-primary-600 hover:text-primary-700 text-sm">Ver</RouterLink>
                  <RouterLink :to="`/appointments/${appt.id}/edit`" class="text-slate-600 hover:text-slate-900 text-sm">Editar</RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Mobile -->
        <div class="md:hidden divide-y divide-slate-100">
          <div v-for="appt in appointments" :key="appt.id" class="p-4">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-medium text-slate-900">{{ appt.patient?.nombre }}</p>
                <p class="text-sm text-slate-500">{{ formatShortDate(appt.fecha) }} · {{ formatTime(appt.horaInicio) }}</p>
              </div>
              <StatusBadge :status="appt.estado" />
            </div>
            <div class="flex gap-3 mt-3">
              <RouterLink :to="`/appointments/${appt.id}`" class="btn-secondary btn-sm text-xs">Ver</RouterLink>
              <RouterLink :to="`/appointments/${appt.id}/edit`" class="btn-secondary btn-sm text-xs">Editar</RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { appointmentsService } from '../../services/appointments.service'
import type { Appointment } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { useFormatters } from '../../composables/useFormatters'
import { useNotification } from '../../composables/useNotification'

const { formatShortDate, formatTime } = useFormatters()
const { error } = useNotification()
const appointments = ref<Appointment[]>([])
const loading = ref(true)
const activeTab = ref('all')
const filterEstado = ref('')
const filterFecha = ref('')

async function loadAppointments() {
  activeTab.value = 'all'
  loading.value = true
  try {
    const params: { estado?: string; fecha?: string } = {}
    if (filterEstado.value) params.estado = filterEstado.value
    if (filterFecha.value) params.fecha = filterFecha.value
    const response = await appointmentsService.getAll(params)
    appointments.value = response.data
  } catch { error('Error al cargar citas') } finally { loading.value = false }
}

async function loadToday() {
  loading.value = true
  try {
    const response = await appointmentsService.getToday()
    appointments.value = response.data
  } catch { error('Error al cargar citas') } finally { loading.value = false }
}

async function loadWeek() {
  loading.value = true
  try {
    const response = await appointmentsService.getWeek()
    appointments.value = response.data
  } catch { error('Error al cargar citas') } finally { loading.value = false }
}

function clearFilters() {
  filterEstado.value = ''
  filterFecha.value = ''
  loadAppointments()
}

onMounted(loadAppointments)
</script>
