<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
    <TransitionGroup name="toast">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="flex items-start gap-3 p-4 rounded-lg shadow-lg border"
        :class="{
          'bg-green-50 border-green-200 text-green-800': n.type === 'success',
          'bg-red-50 border-red-200 text-red-800': n.type === 'error',
          'bg-yellow-50 border-yellow-200 text-yellow-800': n.type === 'warning',
          'bg-blue-50 border-blue-200 text-blue-800': n.type === 'info',
        }"
      >
        <span class="text-lg">
          {{ n.type === 'success' ? '✓' : n.type === 'error' ? '✗' : n.type === 'warning' ? '!' : 'i' }}
        </span>
        <p class="flex-1 text-sm font-medium">{{ n.message }}</p>
        <button @click="remove(n.id)" class="text-current opacity-60 hover:opacity-100">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '../composables/useNotification'
const { notifications, remove } = useNotification()
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100%); }
.toast-leave-to { opacity: 0; transform: translateX(100%); }
</style>
