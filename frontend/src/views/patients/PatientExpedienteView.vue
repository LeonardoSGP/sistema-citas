<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <button @click="router.back()" class="p-2 rounded-lg hover:bg-slate-200">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 class="text-xl font-semibold text-slate-900">Expediente del Paciente</h2>
    </div>

    <LoadingSpinner v-if="loading" />

    <template v-else-if="patient">
      <!-- Patient info card -->
      <div class="card">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-2xl font-bold text-slate-900">{{ patient.nombre }}</p>
            <p class="text-primary-600 font-mono font-semibold mt-1">{{ patient.expediente }}</p>
            <div class="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
              <span>{{ patient.edad }} años</span>
              <span>·</span>
              <span>{{ patient.sexo }}</span>
              <span>·</span>
              <span :class="patient.activo ? 'text-green-600' : 'text-red-500'">{{ patient.activo ? 'Activo' : 'Inactivo' }}</span>
            </div>
          </div>
          <RouterLink :to="`/patients/${patient.id}/edit`" class="btn-secondary btn-sm">Editar</RouterLink>
        </div>
      </div>

      <!-- Appointments -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900">Historial de Citas</h3>
          <button type="button" class="btn-primary btn-sm text-sm" @click="showNewAppointment = true">+ Nueva cita</button>
        </div>
        <EmptyState v-if="!patient.appointments?.length" title="Sin citas" description="No hay citas registradas para este paciente" />
        <div v-else class="space-y-2">
          <div
            v-for="appt in patient.appointments"
            :key="appt.id"
            class="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
            @click="router.push(`/appointments/${appt.id}`)"
          >
            <div class="w-24">
              <p class="text-sm font-semibold text-slate-700">{{ formatShortDate(appt.fecha) }}</p>
              <p class="text-xs text-slate-500">{{ formatTime(appt.horaInicio) }}</p>
            </div>
            <div class="flex-1">
              <p class="text-sm text-slate-700">{{ appt.motivo || 'Sin motivo registrado' }}</p>
            </div>
            <StatusBadge :status="appt.estado" />
          </div>
        </div>
      </div>

      <!-- Session Notes -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900">Notas de Sesión</h3>
          <button type="button" class="btn-primary btn-sm text-sm" @click="showNewNote = true">+ Nueva nota</button>
        </div>
        <EmptyState v-if="!patient.sessionNotes?.length" title="Sin notas" description="No hay notas de sesión registradas" />
        <div v-else class="space-y-3">
          <div
            v-for="note in patient.sessionNotes"
            :key="note.id"
            class="p-4 rounded-lg border border-slate-100 hover:bg-slate-50"
          >
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-semibold text-slate-700">{{ formatDate(note.fecha) }}</p>
              <RouterLink :to="`/session-notes/${note.id}/edit`" class="text-xs text-primary-600 hover:text-primary-700">Editar</RouterLink>
            </div>
            <p class="text-sm text-slate-600">{{ note.motivo || 'Sin motivo registrado' }}</p>
            <p v-if="note.notas" class="text-sm text-slate-500 mt-1 line-clamp-2">{{ note.notas }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
  <FormModal v-model="showNewAppointment">
    <AppointmentFormView modal :initial-patient-id="patient?.id" @close="showNewAppointment = false" @saved="handleAppointmentSaved" />
  </FormModal>
  <FormModal v-model="showNewNote">
    <SessionNoteFormView modal :initial-patient-id="patient?.id" @close="showNewNote = false" @saved="handleNoteSaved" />
  </FormModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { patientsService } from '../../services/patients.service'
import type { Patient } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { useFormatters } from '../../composables/useFormatters'
import FormModal from '../../components/FormModal.vue'
import AppointmentFormView from '../appointments/AppointmentFormView.vue'
import SessionNoteFormView from '../sessionNotes/SessionNoteFormView.vue'

const router = useRouter()
const route = useRoute()
const { formatDate, formatShortDate, formatTime } = useFormatters()
const patient = ref<Patient | null>(null)
const loading = ref(true)
const showNewAppointment = ref(false)
const showNewNote = ref(false)

onMounted(async () => {
  try {
    const response = await patientsService.getExpediente(Number(route.params.id))
    patient.value = response.data
  } catch {
    router.push('/patients')
  } finally {
    loading.value = false
  }
})

async function handleAppointmentSaved() {
  showNewAppointment.value = false
  if (!patient.value) return
  const response = await patientsService.getExpediente(patient.value.id)
  patient.value = response.data
}

async function handleNoteSaved() {
  showNewNote.value = false
  if (!patient.value) return
  const response = await patientsService.getExpediente(patient.value.id)
  patient.value = response.data
}
</script>
