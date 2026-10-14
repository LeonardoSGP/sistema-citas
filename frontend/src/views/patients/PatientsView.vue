<template>
  <div class="space-y-6 rounded-[2rem] bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-4 sm:p-6">
    <div class="flex flex-col gap-4 rounded-[1.75rem] border border-rose-100 bg-rose-100/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nombre o expediente"
          class="input-field min-w-0 flex-1 border-rose-200 bg-rose-50/80 text-rose-950 placeholder-rose-400 focus:border-primary-400 focus:ring-rose-100 sm:min-w-[260px]"
          @input="handleSearch"
        />
        <select v-model="filterSexo" class="input-field w-full flex-none border-rose-200 bg-rose-50/80 text-rose-950 sm:w-56" @change="applyFilters">
          <option value="">Todos los géneros</option>
          <option value="Femenino">Femenino</option>
          <option value="Masculino">Masculino</option>
          <option value="Otro">Otro</option>
        </select>
        <select v-model="filterEdad" class="input-field w-full flex-none border-rose-200 bg-rose-50/80 text-rose-950 sm:w-60" @change="applyFilters">
          <option value="">Todas las edades</option>
          <option value="0-5">0 - 5 años</option>
          <option value="6-11">6 - 11 años</option>
          <option value="12-17">12 - 17 años</option>
          <option value="18-59">18 - 59 años</option>
          <option value="60+">Mayores de 60</option>
        </select>
        <button v-if="filterSexo || filterEdad" @click="clearFilters" class="btn-secondary btn-sm whitespace-nowrap border-rose-200 bg-rose-50 text-primary-700 hover:bg-rose-100">Limpiar filtros</button>
      </div>
      <button type="button" class="btn-primary whitespace-nowrap shadow-rose-200" @click="showNewPatient = true">
        + Nuevo Paciente
      </button>
    </div>

    <div class="card overflow-hidden border-rose-100 bg-fuchsia-50/80 p-0 shadow-[0_10px_35px_-12px_rgba(225,29,72,0.25)]">
      <LoadingSpinner v-if="loading" />
      <EmptyState
        v-else-if="!patients.length"
        title="Sin pacientes"
        description="No se encontraron pacientes registrados"
      >
        <button type="button" class="btn-primary" @click="showNewPatient = true">Registrar primer paciente</button>
      </EmptyState>
      <div v-else>
        <!-- Desktop table -->
        <table class="w-full hidden md:table">
          <thead>
            <tr class="border-b border-rose-200 bg-rose-100/80">
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-primary-800">Expediente</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-primary-800">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-primary-800">Teléfono</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-primary-800">Edad</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-primary-800">Sexo</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-primary-800">Tipo</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-primary-800">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-rose-100">
            <tr v-for="patient in patients" :key="patient.id" :class="patient._count?.appointments ? 'bg-rose-50/40 hover:bg-rose-100/60' : 'bg-emerald-50/50 hover:bg-emerald-100/60'">
              <td class="px-6 py-4 text-sm font-mono text-primary-700">{{ patient.expediente || '-' }}</td>
              <td class="px-6 py-4 text-sm font-medium text-rose-950">{{ patient.nombre }}</td>
              <td class="px-6 py-4 text-sm text-rose-800">{{ formatPhone(patient.telefono) }}</td>
              <td class="px-6 py-4 text-sm text-rose-800">{{ patient.edad }} años</td>
              <td class="px-6 py-4 text-sm text-rose-800">{{ patient.sexo }}</td>
              <td class="px-6 py-4">
                <span v-if="patient._count?.appointments" class="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">Continuidad</span>
                <span v-else class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">Nuevo</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <RouterLink :to="`/patients/${patient.id}/expediente`" class="text-primary-600 hover:text-primary-700 text-sm font-medium">Expediente</RouterLink>
                  <RouterLink :to="`/patients/${patient.id}/edit`" class="text-rose-700 hover:text-primary-900 text-sm">Editar</RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Mobile cards -->
        <div class="divide-y divide-rose-100 md:hidden">
          <div v-for="patient in patients" :key="patient.id" class="p-4" :class="patient._count?.appointments ? 'bg-rose-50/40 hover:bg-rose-100/60' : 'bg-emerald-50/50 hover:bg-emerald-100/60'">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-medium text-rose-950">{{ patient.nombre }}</p>
                <p class="font-mono text-sm text-primary-700">{{ patient.expediente || 'Sin expediente' }}</p>
                <p class="text-sm text-rose-800">{{ patient.edad }} años · {{ patient.sexo }}</p>
                <p class="text-sm text-rose-800">Tel: {{ formatPhone(patient.telefono) }}</p>
              </div>
            </div>
            <div class="flex gap-3 mt-3">
              <RouterLink :to="`/patients/${patient.id}/expediente`" class="btn-secondary btn-sm text-xs">Expediente</RouterLink>
              <RouterLink :to="`/patients/${patient.id}/edit`" class="btn-secondary btn-sm text-xs">Editar</RouterLink>
              <span v-if="patient._count?.appointments" class="rounded-full bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700">Continuidad</span>
              <span v-else class="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">Nuevo</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 border-t border-rose-100 bg-rose-100/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-rose-800">
            Página {{ currentPage }} de {{ totalPages }} · {{ totalPatients }} pacientes
          </p>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-secondary btn-sm border-rose-200 bg-rose-50 text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <span aria-hidden="true">←</span>
              <span>Anterior</span>
            </button>
            <button
              type="button"
              class="btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <span>Siguiente</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <FormModal v-model="showNewPatient">
    <PatientFormView modal @close="showNewPatient = false" @saved="handlePatientSaved" />
  </FormModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { patientsService } from '../../services/patients.service'
import type { Patient } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import { useNotification } from '../../composables/useNotification'
import FormModal from '../../components/FormModal.vue'
import PatientFormView from './PatientFormView.vue'

const { error } = useNotification()
const showNewPatient = ref(false)
const patients = ref<Patient[]>([])
const loading = ref(true)
const search = ref('')
const filterSexo = ref('')
const filterEdad = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalPatients = ref(0)
const pageSize = 5
let searchTimeout: ReturnType<typeof setTimeout>

const ageRangeMap: Record<string, { min: number; max: number }> = {
  '0-5': { min: 0, max: 5 },
  '6-11': { min: 6, max: 11 },
  '12-17': { min: 12, max: 17 },
  '18-59': { min: 18, max: 59 },
  '60+': { min: 60, max: 150 },
}

function formatPhone(phone: string | null): string {
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
    const response = await patientsService.getPaginated({
      ...params,
      page: currentPage.value,
      limit: pageSize,
    })
    patients.value = response.data.items
    totalPages.value = response.data.totalPages
    totalPatients.value = response.data.total
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value
      await loadPatients()
    }
  } catch {
    error('Error al cargar pacientes')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadPatients()
  }, 400)
}

function clearFilters() {
  filterSexo.value = ''
  filterEdad.value = ''
  currentPage.value = 1
  loadPatients()
}

function applyFilters() {
  currentPage.value = 1
  loadPatients()
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadPatients()
}

async function handlePatientSaved() {
  showNewPatient.value = false
  currentPage.value = 1
  await loadPatients()
}

onMounted(loadPatients)
</script>
