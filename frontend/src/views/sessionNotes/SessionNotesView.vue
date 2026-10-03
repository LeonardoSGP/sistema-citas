<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div>
        <select v-model.number="filterPatientId" class="input-field w-auto" @change="loadNotes">
          <option :value="0">Todos los pacientes</option>
          <option v-for="p in patients" :key="p.id" :value="p.id">{{ p.nombre }}</option>
        </select>
      </div>
      <RouterLink to="/session-notes/new" class="btn-primary whitespace-nowrap">+ Nueva Nota</RouterLink>
    </div>

    <div class="card p-0 overflow-hidden">
      <LoadingSpinner v-if="loading" />
      <EmptyState v-else-if="!notes.length" title="Sin notas" description="No hay notas de sesión registradas">
        <RouterLink to="/session-notes/new" class="btn-primary">Crear primera nota</RouterLink>
      </EmptyState>
      <div v-else class="divide-y divide-slate-100">
        <div v-for="note in notes" :key="note.id" class="p-4 hover:bg-slate-50">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="font-medium text-slate-900">{{ note.patient?.nombre }}</p>
                <span class="text-slate-300">|</span>
                <p class="text-sm text-slate-500">{{ formatDate(note.fecha) }}</p>
              </div>
              <p v-if="note.motivo" class="text-sm text-slate-600 mt-1">{{ note.motivo }}</p>
              <p v-if="note.notas" class="text-sm text-slate-400 mt-0.5 line-clamp-2">{{ note.notas }}</p>
            </div>
            <RouterLink :to="`/session-notes/${note.id}/edit`" class="btn-secondary btn-sm text-xs ml-4 flex-shrink-0">Editar</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { sessionNotesService } from '../../services/sessionNotes.service'
import { patientsService } from '../../services/patients.service'
import type { SessionNote, Patient } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import { useFormatters } from '../../composables/useFormatters'
import { useNotification } from '../../composables/useNotification'

const { formatDate } = useFormatters()
const { error } = useNotification()
const notes = ref<SessionNote[]>([])
const patients = ref<Patient[]>([])
const loading = ref(true)
const filterPatientId = ref(0)

async function loadNotes() {
  loading.value = true
  try {
    const params = filterPatientId.value ? { patientId: filterPatientId.value } : undefined
    const response = await sessionNotesService.getAll(params)
    notes.value = response.data
  } catch { error('Error al cargar notas') } finally { loading.value = false }
}

onMounted(async () => {
  try {
    const pRes = await patientsService.getAll({ activo: true })
    patients.value = pRes.data
  } catch { /* ignore */ }
  await loadNotes()
})
</script>
