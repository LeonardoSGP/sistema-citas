<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-3 backdrop-blur-sm sm:p-6"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] shadow-2xl">
          <div class="flex justify-end bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 px-4 pt-4 sm:px-6">
            <button
              type="button"
              class="rounded-full p-2 text-slate-500 transition hover:bg-white/70 hover:text-primary-700"
              aria-label="Cerrar"
              @click="$emit('update:modelValue', false)"
            >
              <span class="text-xl leading-none">×</span>
            </button>
          </div>
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
