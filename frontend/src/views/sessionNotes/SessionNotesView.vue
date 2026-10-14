<template>
  <div class="space-y-6 rounded-[2rem] bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-4 sm:p-6">
    <div class="flex flex-col gap-4 rounded-[1.75rem] border border-rose-100 bg-rose-100/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div class="relative w-full sm:w-80">
          <input
            v-model="patientSearch"
            type="text"
            class="input-field border-rose-200 bg-rose-50/80 text-rose-950"
            placeholder="Buscar paciente"
            @focus="showPatientResults = true"
            @input="handlePatientSearch"
          />
          <button
            v-if="filterPatientId || patientSearch"
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-rose-400 hover:text-primary-700"
            aria-label="Limpiar paciente"
            @click="clearPatientFilter"
          >×</button>
          <div
            v-if="showPatientResults && patientSearch && filteredPatients.length"
            class="absolute z-10 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-rose-200 bg-rose-50 shadow-lg"
          >
            <button
              v-for="patient in filteredPatients"
              :key="patient.id"
              type="button"
              class="block w-full px-4 py-3 text-left text-sm text-rose-900 hover:bg-rose-100"
              @click="selectPatient(patient)"
            >
              <span class="font-medium">{{ patient.nombre }}</span>
              <span class="ml-2 text-xs text-primary-600">Exp. {{ patient.expediente }}</span>
            </button>
          </div>
          <p v-if="showPatientResults && patientSearch && !filteredPatients.length" class="absolute z-10 mt-2 w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-lg">
            No se encontró ese paciente
          </p>
        </div>
      </div>
      <button type="button" class="btn-primary whitespace-nowrap" @click="showNewNote = true">+ Nueva Nota</button>
    </div>

    <div class="card overflow-hidden border-rose-100 bg-fuchsia-50/80 p-0 shadow-[0_10px_35px_-12px_rgba(225,29,72,0.25)]">
      <LoadingSpinner v-if="loading" />
      <EmptyState v-else-if="!notes.length" title="Sin notas" description="No hay notas de sesión registradas">
        <button type="button" class="btn-primary" @click="showNewNote = true">Crear primera nota</button>
      </EmptyState>
      <div v-else>
        <div class="divide-y divide-rose-100">
        <div v-for="note in paginatedNotes" :key="note.id" class="p-4 hover:bg-rose-100/60">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="font-medium text-rose-950">{{ note.patient?.nombre }}</p>
                <span class="text-rose-300">|</span>
                <p class="text-sm text-rose-800">{{ formatDate(note.fecha) }}</p>
              </div>
              <p v-if="note.motivo" class="mt-1 text-sm text-rose-800">{{ note.motivo }}</p>
              <p v-if="note.notas" class="mt-0.5 line-clamp-2 text-sm text-primary-700">{{ note.notas }}</p>
            </div>
            <RouterLink :to="`/session-notes/${note.id}/edit`" class="btn-secondary btn-sm ml-4 flex-shrink-0 border-rose-200 bg-rose-50 text-primary-700 text-xs">Editar</RouterLink>
          </div>
        </div>
      </div>
        <div class="flex flex-col gap-3 border-t border-rose-100 bg-rose-100/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-rose-800">Página {{ currentPage }} de {{ totalPages }} · {{ totalNotes }} notas</p>
          <div class="flex items-center gap-2">
            <button type="button" class="btn-secondary btn-sm border-rose-200 bg-rose-50 text-primary-700 disabled:cursor-not-allowed disabled:opacity-40" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
              <span aria-hidden="true">←</span> Anterior
            </button>
            <button type="button" class="btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-40" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
              Siguiente <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <FormModal v-model="showNewNote">
    <SessionNoteFormView modal @close="showNewNote = false" @saved="handleNoteSaved" />
  </FormModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { sessionNotesService } from '../../services/sessionNotes.service'
import { patientsService } from '../../services/patients.service'
import type { SessionNote, Patient } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import { useFormatters } from '../../composables/useFormatters'
import { useNotification } from '../../composables/useNotification'
import FormModal from '../../components/FormModal.vue'
import SessionNoteFormView from './SessionNoteFormView.vue'

const { formatDate } = useFormatters()
const { error } = useNotification()
const showNewNote = ref(false)
const notes = ref<SessionNote[]>([])
const patients = ref<Patient[]>([])
const loading = ref(true)
const filterPatientId = ref(0)
const patientSearch = ref('')
const showPatientResults = ref(false)
const currentPage = ref(1)
const pageSize = 5
const paginatedNotes = computed(() => notes.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize))
const totalNotes = computed(() => notes.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalNotes.value / pageSize)))
const filteredPatients = computed(() => {
  const query = patientSearch.value.trim().toLowerCase()
  if (!query) return patients.value
  return patients.value.filter((patient) =>
    patient.nombre.toLowerCase().includes(query) ||
    (patient.expediente || '').toLowerCase().includes(query)
  )
})

async function loadNotes() {
  loading.value = true
  currentPage.value = 1
  try {
    const params = filterPatientId.value ? { patientId: filterPatientId.value } : undefined
    const response = await sessionNotesService.getAll(params)
    notes.value = response.data
  } catch { error('Error al cargar notas') } finally { loading.value = false }
}

function handlePatientSearch() {
  filterPatientId.value = 0
  showPatientResults.value = true
}

function selectPatient(patient: Patient) {
  filterPatientId.value = patient.id
  patientSearch.value = patient.nombre
  showPatientResults.value = false
  loadNotes()
}

function clearPatientFilter() {
  filterPatientId.value = 0
  patientSearch.value = ''
  showPatientResults.value = false
  loadNotes()
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

onMounted(async () => {
  try {
    const pRes = await patientsService.getAll({ activo: true })
    patients.value = pRes.data
  } catch { /* ignore */ }
  await loadNotes()
})

async function handleNoteSaved() {
  showNewNote.value = false
  currentPage.value = 1
  await loadNotes()
}
</script>
