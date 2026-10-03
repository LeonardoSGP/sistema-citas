<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div class="flex flex-col sm:flex-row gap-3 flex-1">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nombre o expediente..."
          class="input-field max-w-xs"
          @input="handleSearch"
        />
        <select v-model="filterActivo" class="input-field max-w-xs" @change="loadPatients">
          <option value="">Todos los pacientes</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
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
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Edad</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sexo</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="patient in patients" :key="patient.id" class="hover:bg-slate-50">
              <td class="px-6 py-4 text-sm font-mono text-slate-700">{{ patient.expediente }}</td>
              <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ patient.nombre }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ patient.edad }} años</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ patient.sexo }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="patient.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'">
                  {{ patient.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <RouterLink :to="`/patients/${patient.id}/expediente`" class="text-primary-600 hover:text-primary-700 text-sm font-medium">Expediente</RouterLink>
                  <RouterLink :to="`/patients/${patient.id}/edit`" class="text-slate-600 hover:text-slate-900 text-sm">Editar</RouterLink>
                  <button
                    @click="togglePatientStatus(patient)"
                    class="text-sm"
                    :class="patient.activo ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-700'"
                  >
                    {{ patient.activo ? 'Desactivar' : 'Activar' }}
                  </button>
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
              </div>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="patient.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'">
                {{ patient.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <div class="flex gap-3 mt-3">
              <RouterLink :to="`/patients/${patient.id}/expediente`" class="btn-secondary btn-sm text-xs">Expediente</RouterLink>
              <RouterLink :to="`/patients/${patient.id}/edit`" class="btn-secondary btn-sm text-xs">Editar</RouterLink>
              <button @click="togglePatientStatus(patient)" class="btn-sm text-xs"
                :class="patient.activo ? 'text-red-500' : 'text-green-600'"
              >{{ patient.activo ? 'Desactivar' : 'Activar' }}</button>
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

const { success, error } = useNotification()
const patients = ref<Patient[]>([])
const loading = ref(true)
const search = ref('')
const filterActivo = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

async function loadPatients() {
  loading.value = true
  try {
    const params: { search?: string; activo?: boolean } = {}
    if (search.value) params.search = search.value
    if (filterActivo.value !== '') params.activo = filterActivo.value === 'true'
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

async function togglePatientStatus(patient: Patient) {
  try {
    if (patient.activo) {
      await patientsService.deactivate(patient.id)
      success('Paciente desactivado')
    } else {
      await patientsService.activate(patient.id)
      success('Paciente activado')
    }
    await loadPatients()
  } catch {
    error('Error al cambiar estado del paciente')
  }
}

onMounted(loadPatients)
</script>
