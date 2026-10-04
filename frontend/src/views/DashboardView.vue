<template>
  <div class="space-y-6 rounded-[2rem] bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-4 sm:p-6">
    <div class="rounded-[1.75rem] border border-rose-100 bg-rose-100/70 p-5 shadow-sm">
      <h2 class="text-xl font-semibold text-primary-900">Bienvenida, {{ authStore.user?.nombre }}</h2>
      <p class="mt-1 text-sm text-rose-700">Consulta el resumen de tus pacientes y citas.</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card border-rose-100 bg-fuchsia-50/80">
        <p class="mb-1 text-sm font-medium text-rose-800">Pacientes registrados</p>
        <p class="text-3xl font-bold text-primary-900">{{ stats.totalPatients }}</p>
      </div>
      <div class="card border-rose-100 bg-fuchsia-50/80">
        <p class="mb-1 text-sm text-rose-700">Citas hoy</p>
        <p class="text-3xl font-bold text-primary-700">{{ stats.todayAppointments }}</p>
      </div>
      <div class="card border-rose-100 bg-fuchsia-50/80">
        <p class="mb-1 text-sm text-rose-700">Citas esta semana</p>
        <p class="text-3xl font-bold text-primary-700">{{ stats.weekAppointments }}</p>
      </div>
      <div class="card border-rose-100 bg-fuchsia-50/80">
        <p class="mb-1 text-sm text-rose-700">Próximas programadas</p>
        <p class="text-3xl font-bold text-primary-700">{{ stats.upcomingAppointments }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Calendar -->
      <div class="card border-rose-100 bg-fuchsia-50/80 lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-primary-900">Calendario de Citas ({{ currentMonthName }})</h3>
          <div class="flex gap-2">
            <button @click="prevMonth" class="rounded-lg p-1 text-rose-600 hover:bg-rose-100 hover:text-primary-700">&lt;</button>
            <button @click="nextMonth" class="rounded-lg p-1 text-rose-600 hover:bg-rose-100 hover:text-primary-700">&gt;</button>
          </div>
        </div>
        
        <div class="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-rose-200 bg-rose-200">
          <!-- Days of week -->
          <div v-for="day in ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']" :key="day" class="bg-rose-100/80 py-2 text-center text-xs font-medium text-rose-700">
            {{ day }}
          </div>
          <!-- Days -->
          <div
            v-for="(day, idx) in calendarDays"
            :key="idx"
            class="min-h-[80px] cursor-pointer bg-rose-50/70 p-1 transition-colors hover:bg-rose-100"
            :class="[
              !day.isCurrentMonth ? 'bg-rose-50/40 text-rose-300' : 'text-rose-900',
              day.isToday ? 'ring-2 ring-inset ring-primary-500 bg-pink-100/70' : ''
            ]"
            @click="selectDate(day.date)"
          >
            <p class="p-1 text-xs font-medium" :class="day.isToday ? 'text-primary-700' : ''">{{ day.dayOfMonth }}</p>
            <div class="space-y-1 mt-1">
              <div
                v-for="appt in day.appointments.slice(0, 3)"
                :key="appt.id"
                class="text-[10px] truncate px-1 py-0.5 rounded"
                :class="getApptColorClass(appt.estado)"
                :title="appt.patient?.nombre"
              >
                {{ formatTime(appt.horaInicio) }} {{ appt.patient?.nombre }}
              </div>
              <div v-if="day.appointments.length > 3" class="px-1 text-[10px] font-medium text-rose-600">
                +{{ day.appointments.length - 3 }} más
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's appointments -->
      <div class="card border-rose-100 bg-fuchsia-50/80">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-primary-900">Citas del día</h3>
          <p class="text-xs font-medium text-primary-700">{{ selectedDateFormatted }}</p>
        </div>
        <LoadingSpinner v-if="loadingMonth" />
        <EmptyState v-else-if="!selectedDateAppointments.length" title="Sin citas" description="No hay citas programadas para este día" />
        <div v-else class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          <div
            v-for="appt in selectedDateAppointments"
            :key="appt.id"
            class="flex cursor-pointer items-center gap-3 rounded-lg border border-rose-100 bg-rose-50/50 p-3 transition-colors hover:bg-rose-100/70"
            @click="router.push(`/appointments/${appt.id}`)"
          >
            <div class="w-14 text-center">
              <p class="text-sm font-semibold text-primary-700">{{ formatTime(appt.horaInicio) }}</p>
            </div>
            <div class="flex-1 min-w-0">
              <p class="truncate text-sm font-medium text-rose-950">{{ appt.patient?.nombre }}</p>
              <StatusBadge :status="appt.estado" class="mt-1" />
            </div>
          </div>
        </div>
        <RouterLink :to="{ path: '/appointments/new', query: { date: selectedDateStr } }" class="btn-primary w-full mt-8 py-2 text-sm justify-center">
          Agendar cita
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
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
const { formatTime } = useFormatters()

const todayAppointments = ref<Appointment[]>([])
const weekAppointments = ref<Appointment[]>([])
const monthAppointments = ref<Appointment[]>([])
const totalPatients = ref(0)
const loadingMonth = ref(true)

const currentDate = ref(new Date())
const selectedDateStr = ref(new Date().toISOString().substring(0, 10))

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
})

const selectedDateFormatted = computed(() => {
  const d = new Date(selectedDateStr.value + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' })
})

const stats = computed(() => ({
  totalPatients: totalPatients.value,
  todayAppointments: todayAppointments.value.length,
  weekAppointments: weekAppointments.value.length,
  upcomingAppointments: monthAppointments.value.filter(
    (a) => a.estado === 'Programada' && new Date(a.fecha) >= new Date(new Date().setHours(0,0,0,0))
  ).length,
}))

// Calendar generation logic
interface CalendarDay {
  date: Date
  dayOfMonth: number
  isCurrentMonth: boolean
  isToday: boolean
  appointments: Appointment[]
}

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  const days: CalendarDay[] = []
  
  // Padding for start of month
  const startPadding = firstDayOfMonth.getDay()
  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push(createCalendarDay(d, false))
  }
  
  // Days of month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(year, month, i)
    days.push(createCalendarDay(d, true))
  }
  
  // Padding for end of month
  const endPadding = 42 - days.length // Keep 6 rows for consistency
  for (let i = 1; i <= endPadding; i++) {
    const d = new Date(year, month + 1, i)
    days.push(createCalendarDay(d, false))
  }
  
  return days
})

function createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
  const dateStr = date.toISOString().substring(0, 10)
  const todayStr = new Date().toISOString().substring(0, 10)
  
  const appts = monthAppointments.value.filter(a => a.fecha.startsWith(dateStr))
  
  return {
    date,
    dayOfMonth: date.getDate(),
    isCurrentMonth,
    isToday: dateStr === todayStr,
    appointments: appts
  }
}

const selectedDateAppointments = computed(() => {
  return monthAppointments.value
    .filter(a => a.fecha.startsWith(selectedDateStr.value))
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
})

function selectDate(date: Date) {
  selectedDateStr.value = date.toISOString().substring(0, 10)
}

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  loadMonthData()
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  loadMonthData()
}

function getApptColorClass(status: string) {
  switch(status) {
    case 'Programada': return 'bg-pink-100 text-pink-800'
    case 'Atendida': return 'bg-fuchsia-100 text-fuchsia-800'
    case 'No asistió': return 'bg-rose-100 text-rose-800'
    default: return 'bg-rose-50 text-rose-700'
  }
}

async function loadMonthData() {
  loadingMonth.value = true
  try {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const start = new Date(year, month, 1).toISOString().substring(0, 10)
    const end = new Date(year, month + 1, 0).toISOString().substring(0, 10)
    
    // In a real app we'd fetch with date filters. Since our API returns month relative to current,
    // let's fetch all and filter client side for now.
    const response = await appointmentsService.getAll() 
    monthAppointments.value = response.data.filter(a => {
      const aDate = new Date(a.fecha)
      return aDate.getFullYear() === year && aDate.getMonth() === month
    })
  } catch (err) {
    console.error(err)
  } finally {
    loadingMonth.value = false
  }
}

onMounted(async () => {
  try {
    const [today, week, patients] = await Promise.all([
      appointmentsService.getToday(),
      appointmentsService.getWeek(),
      patientsService.getAll(),
    ])
    todayAppointments.value = today.data
    weekAppointments.value = week.data
    totalPatients.value = patients.data.length
    await loadMonthData()
  } catch (err) {
    console.error(err)
  }
})
</script>
