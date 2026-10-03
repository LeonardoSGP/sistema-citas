<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div class="flex flex-col sm:flex-row gap-3 flex-1 flex-wrap">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nombre, expediente o teléfono..."
          class="input-field max-w-xs"
          @input="handleSearch"
        />
        <select v-model="filterSexo" class="input-field max-w-[160px]" @change="loadPatients">
          <option value="">Todos los géneros</option>
          <option value="Femenino">Femenino</option>
          <option value="Masculino">Masculino</option>
          <option value="Otro">Otro</option>
        </select>
        <select v-model="filterEdad" class="input-field max-w-[180px]" @change="loadPatients">
          <option value="">Todas las edades</option>
          <option value="0-5">0 - 5 años</option>
          <option value="6-11">6 - 11 años</option>
          <option value="12-17">12 - 17 años</option>
          <option value="18-59">18 - 59 años</option>
          <option value="60+">Mayores de 60</option>
        </select>
        <button v-if="filterSexo || filterEdad" @click="clearFilters" class="btn-secondary btn-sm whitespace-nowrap">Limpiar filtros</button>
      </div>
      <RouterLink to="/patients/new" class="btn-primary whitespace-nowrap">
        + Nuevo Paciente
      </RouterLink>
    </div>

    <div class="card p-0 overflow-hidden">
      <LoadingSpinner v-if="loading" />
      <EmptyState
        v-else-if="!patients.length"
        title="Sin pacientes"
        description="No se encontraron pacientes registrados"
      >
        <RouterLink to="/patients/new" class="btn-primary">Registrar primer paciente</RouterLink>
      </EmptyState>
      <div v-else>
        <!-- Desktop table -->
        <table class="w-full hidden md:table">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50">
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expediente</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Teléfono</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Edad</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sexo</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="patient in patients" :key="patient.id" class="hover:bg-slate-50">
              <td class="px-6 py-4 text-sm font-mono text-slate-700">{{ patient.expediente }}</td>
              <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ patient.nombre }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ formatPhone(patient.telefono) }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ patient.edad }} años</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ patient.sexo }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <RouterLink :to="`/patients/${patient.id}/expediente`" class="text-primary-600 hover:text-primary-700 text-sm font-medium">Expediente</RouterLink>
                  <RouterLink :to="`/patients/${patient.id}/edit`" class="text-slate-600 hover:text-slate-900 text-sm">Editar</RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Mobile cards -->
        <div class="md:hidden divide-y divide-slate-100">
          <div v-for="patient in patients" :key="patient.id" class="p-4 hover:bg-slate-50">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-medium text-slate-900">{{ patient.nombre }}</p>
                <p class="text-sm text-slate-500 font-mono">{{ patient.expediente }}</p>
                <p class="text-sm text-slate-500">{{ patient.edad }} años · {{ patient.sexo }}</p>
                <p class="text-sm text-slate-500">Tel: {{ formatPhone(patient.telefono) }}</p>
              </div>
            </div>
            <div class="flex gap-3 mt-3">
              <RouterLink :to="`/patients/${patient.id}/expediente`" class="btn-secondary btn-sm text-xs">Expediente</RouterLink>
              <RouterLink :to="`/patients/${patient.id}/edit`" class="btn-secondary btn-sm text-xs">Editar</RouterLink>
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
import { patientsService } from '../../services/patients.service'
import type { Patient } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import { useNotification } from '../../composables/useNotification'

const { error } = useNotification()
const patients = ref<Patient[]>([])
const loading = ref(true)
const search = ref('')
const filterSexo = ref('')
const filterEdad = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const ageRangeMap: Record<string, { min: number; max: number }> = {
  '0-5': { min: 0, max: 5 },
  '6-11': { min: 6, max: 11 },
  '12-17': { min: 12, max: 17 },
  '18-59': { min: 18, max: 59 },
  '60+': { min: 60, max: 150 },
}

function formatPhone(phone: string): string {
  if (!phone || phone.length !== 10) return phone || '-'
  return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`
}

async function loadPatients() {
  loading.value = true
  try {
    const params: { search?: string; sexo?: string; edadMin?: number; edadMax?: number } = {}
    if (search.value) params.search = search.value
    if (filterSexo.value) params.sexo = filterSexo.value
    if (filterEdad.value && ageRangeMap[filterEdad.value]) {
      params.edadMin = ageRangeMap[filterEdad.value].min
      params.edadMax = ageRangeMap[filterEdad.value].max
    }
    const response = await patientsService.getAll(params)
    patients.value = response.data
  } catch {
    error('Error al cargar pacientes')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadPatients, 400)
}

function clearFilters() {
  filterSexo.value = ''
  filterEdad.value = ''
  loadPatients()
}

onMounted(loadPatients)
</script>
