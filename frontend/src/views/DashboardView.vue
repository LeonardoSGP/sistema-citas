<template>
  <div class="space-y-6">
    <h2 class="text-xl font-semibold text-slate-900">Bienvenida, {{ authStore.user?.nombre }}</h2>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card bg-primary-50 border-primary-100">
        <p class="text-sm font-medium text-primary-800 mb-1">Pacientes registrados</p>
        <p class="text-3xl font-bold text-primary-900">{{ stats.totalPatients }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-slate-500 mb-1">Citas hoy</p>
        <p class="text-3xl font-bold text-primary-600">{{ stats.todayAppointments }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-slate-500 mb-1">Citas esta semana</p>
        <p class="text-3xl font-bold text-primary-600">{{ stats.weekAppointments }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-slate-500 mb-1">Próximas programadas</p>
        <p class="text-3xl font-bold text-primary-600">{{ stats.upcomingAppointments }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Calendar -->
      <div class="card lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900">Calendario de Citas ({{ currentMonthName }})</h3>
          <div class="flex gap-2">
            <button @click="prevMonth" class="p-1 rounded hover:bg-slate-100 text-slate-600">&lt;</button>
            <button @click="nextMonth" class="p-1 rounded hover:bg-slate-100 text-slate-600">&gt;</button>
          </div>
        </div>
        
        <div class="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
          <!-- Days of week -->
          <div v-for="day in ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']" :key="day" class="bg-slate-50 py-2 text-center text-xs font-medium text-slate-500">
            {{ day }}
          </div>
          <!-- Days -->
          <div
            v-for="(day, idx) in calendarDays"
            :key="idx"
            class="bg-white min-h-[80px] p-1 transition-colors hover:bg-slate-50 cursor-pointer"
            :class="[
              !day.isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'text-slate-700',
              day.isToday ? 'ring-2 ring-inset ring-primary-500 bg-primary-50/10' : ''
            ]"
            @click="selectDate(day.date)"
          >
            <p class="text-xs font-medium p-1" :class="day.isToday ? 'text-primary-700' : ''">{{ day.dayOfMonth }}</p>
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
              <div v-if="day.appointments.length > 3" class="text-[10px] text-slate-500 px-1 font-medium">
                +{{ day.appointments.length - 3 }} más
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's appointments -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900">Citas del día</h3>
          <p class="text-xs text-primary-600 font-medium">{{ selectedDateFormatted }}</p>
        </div>
        <LoadingSpinner v-if="loadingMonth" />
        <EmptyState v-else-if="!selectedDateAppointments.length" title="Sin citas" description="No hay citas programadas para este día" />
        <div v-else class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          <div
            v-for="appt in selectedDateAppointments"
            :key="appt.id"
            class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
            @click="router.push(`/appointments/${appt.id}`)"
          >
            <div class="w-14 text-center">
              <p class="text-sm font-semibold text-primary-600">{{ formatTime(appt.horaInicio) }}</p>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900 truncate">{{ appt.patient?.nombre }}</p>
              <StatusBadge :status="appt.estado" class="mt-1" />
            </div>
          </div>
        </div>
        <RouterLink :to="{ path: '/appointments/new', query: { date: selectedDateStr } }" class="btn-primary w-full mt-4 justify-center">
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
    case 'Programada': return 'bg-blue-100 text-blue-800'
    case 'Atendida': return 'bg-green-100 text-green-800'
    case 'Cancelada': return 'bg-red-100 text-red-800'
    case 'No asistió': return 'bg-slate-200 text-slate-700'
    default: return 'bg-slate-100 text-slate-600'
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
