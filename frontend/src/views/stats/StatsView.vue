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
          <span class="text-sm font-medium text-primary-700">{{ stats.totalPatients }}</span>
        </div>
        <p v-if="!stats.attendedPatients.length" class="text-sm text-rose-700">
          No hay pacientes atendidos en este periodo.
        </p>
        <div v-else class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="patient in stats.attendedPatients"
            :key="patient.id"
            class="rounded-xl border border-rose-100 bg-rose-50/70 px-3 py-2 text-sm text-rose-900"
          >
            {{ patient.nombre }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { appointmentsService } from '../../services/appointments.service'
import type { PatientStats } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import { useNotification } from '../../composables/useNotification'

const { error } = useNotification()
const loading = ref(true)
const period = ref<'week' | 'month'>('week')
const stats = ref<PatientStats | null>(null)
const today = new Date()
const selectedWeek = ref(today.toISOString().slice(0, 10))
const selectedMonth = ref(today.toISOString().slice(0, 7))

function getPercentage(value: number) {
  if (!stats.value || stats.value.totalPatients === 0) return 0
  return (value / stats.value.totalPatients) * 100
}

function getPluralLabel(value: number, singular: string, plural: string) {
  return value === 1 ? singular : plural
}

async function loadStats() {
  loading.value = true
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

onMounted(loadStats)
</script>
