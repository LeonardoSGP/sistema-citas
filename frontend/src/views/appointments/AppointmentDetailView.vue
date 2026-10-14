<template>
  <div class="space-y-6 max-w-6xl">
    <div class="flex items-center gap-3">
      <button @click="router.back()" class="p-2 rounded-lg hover:bg-slate-200">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 class="text-xl font-semibold text-slate-900">Detalle de Cita</h2>
    </div>

    <LoadingSpinner v-if="loading" />

    <template v-else-if="appointment">
      <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
      <div class="card">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-lg font-semibold text-slate-900">{{ appointment.patient?.nombre }}</p>
            <p class="text-sm text-slate-500 font-mono">{{ appointment.patient?.expediente }}</p>
          </div>
          <StatusBadge :status="appointment.estado" />
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-slate-500">Fecha</p>
            <p class="font-medium">{{ formatDate(appointment.fecha) }}</p>
          </div>
          <div>
            <p class="text-slate-500">Horario</p>
            <p class="font-medium">{{ formatTime(appointment.horaInicio) }} - {{ formatTime(appointment.horaFin) }}</p>
          </div>
          <div class="col-span-2" v-if="appointment.motivo">
            <p class="text-slate-500">Motivo</p>
            <p class="font-medium">{{ appointment.motivo }}</p>
          </div>
          <div class="col-span-2" v-if="appointment.observaciones">
            <p class="text-slate-500">Observaciones</p>
            <p class="font-medium">{{ appointment.observaciones }}</p>
          </div>
        </div>

        <!-- Status change -->
        <div class="mt-6 pt-4 border-t border-slate-200">
          <p class="text-sm text-slate-500 mb-3">Cambiar estado:</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="estado in statuses"
              :key="estado"
              @click="changeStatus(estado)"
              :disabled="appointment.estado === estado"
              class="px-3 py-1 rounded-full text-xs font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >{{ estado }}</button>
          </div>
        </div>

        <div class="mt-4 flex gap-3">
          <RouterLink :to="`/appointments/${appointment.id}/edit`" class="btn-secondary">Editar cita</RouterLink>
          <RouterLink :to="{ path: '/session-notes/new', query: { appointmentId: appointment.id, patientId: appointment.patientId } }" class="btn-primary">+ Nota de sesión</RouterLink>
        </div>
      </div>

      <aside class="card border-rose-100 bg-gradient-to-br from-rose-50 to-fuchsia-50 lg:sticky lg:top-6">
        <div class="mb-5 flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-primary-600">Paciente</p>
            <h3 class="mt-1 text-xl font-semibold text-slate-900">{{ appointment.patient?.nombre }}</h3>
          </div>
          <StatusBadge :status="appointment.patient?.activo ? 'Activo' : 'Inactivo'" />
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-xl border border-rose-100 bg-white/70 p-3">
            <p class="text-xs text-slate-500">Expediente</p>
            <p class="mt-1 font-semibold text-primary-700">{{ appointment.patient?.expediente || 'Sin asignar' }}</p>
          </div>
          <div class="rounded-xl border border-rose-100 bg-white/70 p-3">
            <p class="text-xs text-slate-500">Edad</p>
            <p class="mt-1 font-semibold text-slate-800">{{ appointment.patient?.edad ?? 0 }} años</p>
          </div>
          <div class="rounded-xl border border-rose-100 bg-white/70 p-3">
            <p class="text-xs text-slate-500">Sexo</p>
            <p class="mt-1 font-semibold text-slate-800">{{ appointment.patient?.sexo || 'Sin registrar' }}</p>
          </div>
          <div class="rounded-xl border border-rose-100 bg-white/70 p-3">
            <p class="text-xs text-slate-500">Teléfono</p>
            <p class="mt-1 break-all font-semibold text-slate-800">{{ appointment.patient?.telefono || 'Sin registrar' }}</p>
          </div>
        </div>

        <RouterLink
          :to="`/patients/${appointment.patientId}/edit`"
          class="btn-primary mt-5 flex w-full justify-center"
        >
          Editar paciente
        </RouterLink>
        <RouterLink
          :to="`/patients/${appointment.patientId}/expediente`"
          class="btn-secondary mt-2 flex w-full justify-center"
        >
          Ver expediente
        </RouterLink>
      </aside>
      </div>

      <!-- Session notes -->
      <div class="card lg:max-w-[calc(100%-21rem)]">
        <h3 class="font-semibold text-slate-900 mb-4">Notas de sesión</h3>
        <EmptyState v-if="!appointment.sessionNotes?.length" title="Sin notas" description="No hay notas de sesión para esta cita" />
        <div v-else class="space-y-3">
          <div v-for="note in appointment.sessionNotes" :key="note.id" class="p-4 bg-slate-50 rounded-lg">
            <p class="text-sm font-medium text-slate-700 mb-1">{{ formatDate(note.fecha) }}</p>
            <p v-if="note.motivo" class="text-sm text-slate-600">{{ note.motivo }}</p>
            <p v-if="note.notas" class="text-sm text-slate-500 mt-1">{{ note.notas }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { appointmentsService } from '../../services/appointments.service'
import type { Appointment, AppointmentStatus } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { useFormatters } from '../../composables/useFormatters'
import { useNotification } from '../../composables/useNotification'

const router = useRouter()
const route = useRoute()
const { formatDate, formatTime } = useFormatters()
const { success, error } = useNotification()

const appointment = ref<Appointment | null>(null)
const loading = ref(true)
const statuses: AppointmentStatus[] = ['Programada', 'Atendida', 'No asistió']

async function changeStatus(estado: AppointmentStatus) {
  try {
    await appointmentsService.changeStatus(Number(route.params.id), estado)
    if (appointment.value) appointment.value.estado = estado
    success('Estado actualizado')
  } catch { error('Error al cambiar estado') }
}

onMounted(async () => {
  try {
    const response = await appointmentsService.getById(Number(route.params.id))
    appointment.value = response.data
  } catch { router.push('/appointments') } finally { loading.value = false }
})
</script>
