<template>
  <div class="space-y-6 rounded-[2rem] bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-4 sm:p-6">
    <div class="flex flex-col gap-4 rounded-[1.75rem] border border-rose-100 bg-rose-100/70 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <h2 class="text-xl font-semibold text-primary-900">Estadísticas de pacientes atendidos</h2>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="flex w-fit gap-1 rounded-2xl border border-rose-200 bg-rose-50/80 p-1">
        <button
          @click="period = 'week'; loadStats()"
          class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="period === 'week' ? 'bg-white shadow text-primary-800' : 'text-rose-700 hover:text-primary-900'"
        >Por Semana</button>
        <button
          @click="period = 'month'; loadStats()"
          class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="period === 'month' ? 'bg-white shadow text-primary-800' : 'text-rose-700 hover:text-primary-900'"
        >Por Mes</button>
        </div>
        <input
          v-if="period === 'week'"
          v-model="selectedWeek"
          type="date"
          class="input-field w-full border-rose-200 bg-rose-50/80 text-rose-950 sm:w-auto"
          aria-label="Seleccionar semana"
          @change="loadStats"
        />
        <input
          v-else
          v-model="selectedMonth"
          type="month"
          class="input-field w-full border-rose-200 bg-rose-50/80 text-rose-950 sm:w-auto"
          aria-label="Seleccionar mes"
          @change="loadStats"
        />
      </div>
    </div>

    <LoadingSpinner v-if="loading" />

    <template v-else-if="stats">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Gender Breakdown -->
        <div class="card border-rose-100 bg-fuchsia-50/80">
          <h3 class="mb-4 font-semibold text-primary-900">Por Género</h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-rose-800">Mujeres</span>
                <span class="font-medium">{{ stats.gender.mujeres }}</span>
              </div>
              <div class="h-2 w-full rounded-full bg-rose-100">
                <div class="bg-pink-500 h-2 rounded-full" :style="{ width: getPercentage(stats.gender.mujeres) + '%' }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-rose-800">Hombres</span>
                <span class="font-medium">{{ stats.gender.hombres }}</span>
              </div>
              <div class="h-2 w-full rounded-full bg-rose-100">
                <div class="bg-blue-500 h-2 rounded-full" :style="{ width: getPercentage(stats.gender.hombres) + '%' }"></div>
              </div>
            </div>
            <div v-if="stats.gender.otros > 0">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-rose-800">Otro</span>
                <span class="font-medium">{{ stats.gender.otros }}</span>
              </div>
              <div class="h-2 w-full rounded-full bg-rose-100">
                <div class="bg-purple-500 h-2 rounded-full" :style="{ width: getPercentage(stats.gender.otros) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Age Breakdown -->
        <div class="card border-rose-100 bg-fuchsia-50/80">
          <h3 class="mb-4 font-semibold text-primary-900">Por Rango de Edad</h3>
          <div class="space-y-4">
            <div v-for="(data, range) in stats.ageRanges" :key="range">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-rose-800">
                  {{ range === '0-5' ? '0 a 5 años' : range === '6-11' ? '6 a 11 años' : range === '12-17' ? '12 a 17 años' : range === '18-59' ? '18 a 59 años' : 'Mayores de 60' }}
                </span>
                <span class="font-medium">{{ data.total }}</span>
              </div>
              <div class="flex h-2 w-full overflow-hidden rounded-full bg-rose-100">
                <div v-if="data.mujeres > 0" class="bg-pink-500 h-full" :style="{ width: (data.mujeres / (data.total || 1) * 100) + '%' }" title="Mujeres"></div>
                <div v-if="data.hombres > 0" class="bg-blue-500 h-full" :style="{ width: (data.hombres / (data.total || 1) * 100) + '%' }" title="Hombres"></div>
              </div>
              <div class="flex text-[10px] gap-3 mt-1" v-if="data.total > 0">
                <span v-if="data.mujeres > 0" class="text-pink-600">{{ data.mujeres }} {{ getPluralLabel(data.mujeres, 'mujer', 'mujeres') }}</span>
                <span v-if="data.hombres > 0" class="text-blue-600">{{ data.hombres }} {{ getPluralLabel(data.hombres, 'hombre', 'hombres') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-rose-100 bg-fuchsia-50/80">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="font-semibold text-primary-900">Pacientes atendidos</h3>
          <span class="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-primary-700">
            {{ filteredPatients.length }} de {{ stats.totalPatients }}
          </span>
        </div>
        <div v-if="stats.attendedPatients.length" class="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-3 md:grid-cols-3">
          <input
            v-model="patientSearch"
            type="search"
            class="input-field bg-white"
            placeholder="Buscar nombre, expediente o teléfono"
            aria-label="Buscar paciente atendido"
          />
          <select v-model="patientSex" class="input-field bg-white" aria-label="Filtrar por sexo">
            <option value="">Todos los sexos</option>
            <option value="Femenino">Mujeres</option>
            <option value="Masculino">Hombres</option>
            <option value="Otro">Otro</option>
          </select>
          <select v-model="patientAgeRange" class="input-field bg-white" aria-label="Filtrar por rango de edad">
            <option value="">Todas las edades</option>
            <option value="0-5">0 a 5 años</option>
            <option value="6-11">6 a 11 años</option>
            <option value="12-17">12 a 17 años</option>
            <option value="18-59">18 a 59 años</option>
            <option value="60+">60 años o más</option>
          </select>
        </div>
        <p v-if="!stats.attendedPatients.length" class="text-sm text-rose-700">
          No hay pacientes atendidos en este periodo.
        </p>
        <p v-else-if="!filteredPatients.length" class="rounded-xl border border-rose-100 bg-rose-50/60 p-4 text-sm text-rose-700">
          No hay pacientes que coincidan con los filtros seleccionados.
        </p>
        <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div
            v-for="patient in paginatedPatients"
            :key="patient.id"
            class="overflow-hidden rounded-2xl border border-rose-200 bg-white/70 shadow-sm"
          >
            <div class="border-b border-rose-100 bg-rose-50/80 px-4 py-3">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate font-semibold text-primary-900">{{ patient.nombre }}</p>
                  <p class="mt-1 text-xs text-rose-700">
                    {{ patient.edad }} años · {{ patient.sexo }}
                  </p>
                </div>
                <span class="shrink-0 rounded-lg bg-fuchsia-100 px-2 py-1 text-xs font-medium text-primary-700">
                  {{ patient.appointments.length }}
                  {{ getPluralLabel(patient.appointments.length, 'asistencia', 'asistencias') }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 px-4 py-3 text-xs">
              <div>
                <p class="text-rose-500">Expediente</p>
                <p class="mt-0.5 font-medium text-rose-900">{{ patient.expediente || 'Sin asignar' }}</p>
              </div>
              <div>
                <p class="text-rose-500">Teléfono</p>
                <p class="mt-0.5 font-medium text-rose-900">{{ patient.telefono || 'Sin registrar' }}</p>
              </div>
            </div>

            <div class="space-y-3 border-t border-rose-100 px-4 py-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-primary-700">Detalle de asistencia</p>
              <div
                v-for="appointment in patient.appointments"
                :key="appointment.id"
                class="rounded-xl border border-rose-100 bg-rose-50/50 p-3"
              >
                <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span class="font-medium text-rose-900">{{ formatShortDate(appointment.fecha) }}</span>
                  <span class="text-primary-700">
                    {{ formatTime(appointment.horaInicio) }} - {{ formatTime(appointment.horaFin) }}
                  </span>
                </div>
                <p v-if="appointment.motivo" class="mt-2 text-xs text-rose-800">
                  <span class="font-medium">Motivo:</span> {{ appointment.motivo }}
                </p>
                <p v-if="appointment.observaciones" class="mt-1 text-xs text-rose-700">
                  <span class="font-medium">Observaciones:</span> {{ appointment.observaciones }}
                </p>
              </div>
            </div>
          </div>
          <div v-if="filteredPatients.length" class="mt-5 flex flex-col gap-3 border-t border-rose-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm text-rose-700">
              Página {{ patientPage }} de {{ totalPatientPages }}
            </p>
            <div class="flex gap-2">
              <button
                type="button"
                class="btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="patientPage === 1"
                @click="changePatientPage(patientPage - 1)"
              >
                Anterior
              </button>
              <button
                type="button"
                class="btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="patientPage === totalPatientPages"
                @click="changePatientPage(patientPage + 1)"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { appointmentsService } from '../../services/appointments.service'
import type { PatientStats } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import { useNotification } from '../../composables/useNotification'
import { useFormatters } from '../../composables/useFormatters'

const { error } = useNotification()
const { formatShortDate, formatTime } = useFormatters()
const loading = ref(true)
const period = ref<'week' | 'month'>('week')
const stats = ref<PatientStats | null>(null)
const today = new Date()
const selectedWeek = ref(today.toISOString().slice(0, 10))
const selectedMonth = ref(today.toISOString().slice(0, 7))
const patientSearch = ref('')
const patientSex = ref('')
const patientAgeRange = ref('')
const patientPage = ref(1)
const patientsPerPage = 4

const filteredPatients = computed(() => {
  if (!stats.value) return []
  const query = patientSearch.value.trim().toLocaleLowerCase('es')
  return stats.value.attendedPatients.filter((patient) => {
    const matchesSearch = !query ||
      patient.nombre.toLocaleLowerCase('es').includes(query) ||
      (patient.expediente || '').includes(query) ||
      (patient.telefono || '').includes(query)
    const matchesSex = !patientSex.value || patient.sexo === patientSex.value
    const matchesAge = !patientAgeRange.value || (
      patientAgeRange.value === '0-5' ? patient.edad <= 5 :
      patientAgeRange.value === '6-11' ? patient.edad >= 6 && patient.edad <= 11 :
      patientAgeRange.value === '12-17' ? patient.edad >= 12 && patient.edad <= 17 :
      patientAgeRange.value === '18-59' ? patient.edad >= 18 && patient.edad <= 59 :
      patient.edad >= 60
    )
    return matchesSearch && matchesSex && matchesAge
  })
})

const totalPatientPages = computed(() =>
  Math.max(1, Math.ceil(filteredPatients.value.length / patientsPerPage))
)

const paginatedPatients = computed(() => {
  const start = (patientPage.value - 1) * patientsPerPage
  return filteredPatients.value.slice(start, start + patientsPerPage)
})

watch([patientSearch, patientSex, patientAgeRange], () => {
  patientPage.value = 1
})

watch(totalPatientPages, (pages) => {
  if (patientPage.value > pages) patientPage.value = pages
})

function getPercentage(value: number) {
  if (!stats.value || stats.value.totalPatients === 0) return 0
  return (value / stats.value.totalPatients) * 100
}

function getPluralLabel(value: number, singular: string, plural: string) {
  return value === 1 ? singular : plural
}

async function loadStats() {
  loading.value = true
  patientPage.value = 1
  try {
    const referenceDate = period.value === 'week' ? selectedWeek.value : `${selectedMonth.value}-01`
    const response = await appointmentsService.getStats(period.value, referenceDate)
    stats.value = response.data
  } catch {
    error('Error al cargar las estadísticas')
  } finally {
    loading.value = false
  }
}

function changePatientPage(page: number) {
  if (page < 1 || page > totalPatientPages.value) return
  patientPage.value = page
}

onMounted(loadStats)
</script>
