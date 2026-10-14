<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-3 backdrop-blur-sm sm:p-6"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] shadow-2xl">
          <button
            type="button"
            class="absolute right-4 top-4 z-20 rounded-full p-2 text-slate-500 transition hover:bg-white/70 hover:text-primary-700 sm:right-6"
            aria-label="Cerrar"
            @click="$emit('update:modelValue', false)"
          >
            <span class="text-xl leading-none">×</span>
          </button>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
