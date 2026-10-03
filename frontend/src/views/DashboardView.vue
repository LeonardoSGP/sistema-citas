<template>
  <div class="space-y-6">
    <h2 class="text-xl font-semibold text-slate-900">Bienvenida, {{ authStore.user?.nombre }}</h2>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card">
        <p class="text-sm text-slate-500 mb-1">Pacientes activos</p>
        <p class="text-3xl font-bold text-primary-600">{{ stats.totalPatients }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-slate-500 mb-1">Citas hoy</p>
        <p class="text-3xl font-bold text-primary-600">{{ stats.todayAppointments }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-slate-500 mb-1">Esta semana</p>
        <p class="text-3xl font-bold text-primary-600">{{ stats.weekAppointments }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-slate-500 mb-1">Próximas citas</p>
        <p class="text-3xl font-bold text-primary-600">{{ stats.upcomingAppointments }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Today's appointments -->
      <div class="card">
        <h3 class="font-semibold text-slate-900 mb-4">Citas de hoy</h3>
        <LoadingSpinner v-if="loadingToday" />
        <EmptyState v-else-if="!todayAppointments.length" title="Sin citas hoy" description="No hay citas programadas para hoy" />
        <div v-else class="space-y-3">
          <div
            v-for="appt in todayAppointments"
            :key="appt.id"
            class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
            @click="router.push(`/appointments/${appt.id}`)"
          >
            <div class="w-16 text-center">
              <p class="text-sm font-semibold text-primary-600">{{ formatTime(appt.horaInicio) }}</p>
              <p class="text-xs text-slate-400">{{ formatTime(appt.horaFin) }}</p>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900 truncate">{{ appt.patient?.nombre }}</p>
              <p class="text-xs text-slate-500">{{ appt.patient?.expediente }}</p>
            </div>
            <StatusBadge :status="appt.estado" />
          </div>
        </div>
      </div>

      <!-- Upcoming appointments -->
      <div class="card">
        <h3 class="font-semibold text-slate-900 mb-4">Próximas citas (semana)</h3>
        <LoadingSpinner v-if="loadingWeek" />
        <EmptyState v-else-if="!weekAppointments.length" title="Sin citas esta semana" description="No hay citas programadas para esta semana" />
        <div v-else class="space-y-3">
          <div
            v-for="appt in weekAppointments.slice(0, 8)"
            :key="appt.id"
            class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
            @click="router.push(`/appointments/${appt.id}`)"
          >
            <div class="w-20 text-center">
              <p class="text-xs font-semibold text-slate-700">{{ formatShortDate(appt.fecha) }}</p>
              <p class="text-xs text-primary-600">{{ formatTime(appt.horaInicio) }}</p>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900 truncate">{{ appt.patient?.nombre }}</p>
            </div>
            <StatusBadge :status="appt.estado" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { appointmentsService } from '../services/appointments.service'
import { patientsService } from '../services/patients.service'
import type { Appointment } from '../types'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useFormatters } from '../composables/useFormatters'

const router = useRouter()
const authStore = useAuthStore()
const { formatTime, formatShortDate } = useFormatters()

const todayAppointments = ref<Appointment[]>([])
const weekAppointments = ref<Appointment[]>([])
const totalPatients = ref(0)
const loadingToday = ref(true)
const loadingWeek = ref(true)

const stats = computed(() => ({
  totalPatients: totalPatients.value,
  todayAppointments: todayAppointments.value.length,
  weekAppointments: weekAppointments.value.length,
  upcomingAppointments: weekAppointments.value.filter(
    (a) => a.estado === 'Programada' || a.estado === 'Confirmada'
  ).length,
}))

onMounted(async () => {
  try {
    const [today, week, patients] = await Promise.all([
      appointmentsService.getToday(),
      appointmentsService.getWeek(),
      patientsService.getAll({ activo: true }),
    ])
    todayAppointments.value = today.data
    weekAppointments.value = week.data
    totalPatients.value = patients.data.length
  } catch (err) {
    console.error(err)
  } finally {
    loadingToday.value = false
    loadingWeek.value = false
  }
})
</script>
