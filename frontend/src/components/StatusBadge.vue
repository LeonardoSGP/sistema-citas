<template>
  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="badgeClass">
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppointmentStatus } from '../types'

const props = defineProps<{ status: AppointmentStatus | string }>()

const badgeClass = computed(() => {
  const map: Record<string, string> = {
    'Programada': 'bg-blue-100 text-blue-700',
    'Confirmada': 'bg-amber-100 text-amber-700',
    'Atendida': 'bg-green-100 text-green-700',
    'Cancelada': 'bg-red-100 text-red-700',
    'No asistió': 'bg-slate-100 text-slate-600',
  }
  return map[props.status] || 'bg-slate-100 text-slate-600'
})
</script>
