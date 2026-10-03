<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-slate-900">Estadísticas de Pacientes Atendidos</h2>
      <div class="flex bg-slate-100 p-1 rounded-lg">
        <button
          @click="period = 'week'; loadStats()"
          class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="period === 'week' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'"
        >Por Semana</button>
        <button
          @click="period = 'month'; loadStats()"
          class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="period === 'month' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'"
        >Por Mes</button>
      </div>
    </div>

    <LoadingSpinner v-if="loading" />

    <template v-else-if="stats">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card bg-primary-50 border-primary-100">
          <p class="text-sm font-medium text-primary-800">Total pacientes únicos atendidos</p>
          <p class="text-3xl font-bold text-primary-900">{{ stats.totalPatients }}</p>
          <p class="text-xs text-primary-600 mt-1">En el periodo seleccionado</p>
        </div>
        <div class="card bg-slate-50">
          <p class="text-sm font-medium text-slate-600">Total citas atendidas</p>
          <p class="text-3xl font-bold text-slate-900">{{ stats.totalAppointments }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Gender Breakdown -->
        <div class="card">
          <h3 class="font-semibold text-slate-900 mb-4">Por Género</h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-slate-600">Mujeres</span>
                <span class="font-medium">{{ stats.gender.mujeres }}</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div class="bg-pink-500 h-2 rounded-full" :style="{ width: getPercentage(stats.gender.mujeres) + '%' }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-slate-600">Hombres</span>
                <span class="font-medium">{{ stats.gender.hombres }}</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div class="bg-blue-500 h-2 rounded-full" :style="{ width: getPercentage(stats.gender.hombres) + '%' }"></div>
              </div>
            </div>
            <div v-if="stats.gender.otros > 0">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-slate-600">Otro</span>
                <span class="font-medium">{{ stats.gender.otros }}</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div class="bg-purple-500 h-2 rounded-full" :style="{ width: getPercentage(stats.gender.otros) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Age Breakdown -->
        <div class="card">
          <h3 class="font-semibold text-slate-900 mb-4">Por Rango de Edad</h3>
          <div class="space-y-4">
            <div v-for="(data, range) in stats.ageRanges" :key="range">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-slate-600">
                  {{ range === '0-5' ? '0 a 5 años' : range === '6-11' ? '6 a 11 años' : range === '12-17' ? '12 a 17 años' : range === '18-59' ? '18 a 59 años' : 'Mayores de 60' }}
                </span>
                <span class="font-medium">{{ data.total }}</span>
              </div>
              <div class="w-full flex h-2 rounded-full overflow-hidden bg-slate-100">
                <div v-if="data.mujeres > 0" class="bg-pink-500 h-full" :style="{ width: (data.mujeres / (data.total || 1) * 100) + '%' }" title="Mujeres"></div>
                <div v-if="data.hombres > 0" class="bg-blue-500 h-full" :style="{ width: (data.hombres / (data.total || 1) * 100) + '%' }" title="Hombres"></div>
              </div>
              <div class="flex text-[10px] gap-3 mt-1" v-if="data.total > 0">
                <span v-if="data.mujeres > 0" class="text-pink-600">{{ data.mujeres }} mujeres</span>
                <span v-if="data.hombres > 0" class="text-blue-600">{{ data.hombres }} hombres</span>
              </div>
            </div>
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

function getPercentage(value: number) {
  if (!stats.value || stats.value.totalPatients === 0) return 0
  return (value / stats.value.totalPatients) * 100
}

async function loadStats() {
  loading.value = true
  try {
    const response = await appointmentsService.getStats(period.value)
    stats.value = response.data
  } catch {
    error('Error al cargar las estadísticas')
  } finally {
    loading.value = false
  }
}

onMounted(loadStats)
</script>
