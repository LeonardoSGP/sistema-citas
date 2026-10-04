<template>
  <div class="min-h-screen bg-slate-50">
    <AppSidebar
      :is-open="sidebarOpen"
      :is-expanded="sidebarExpanded"
      @close="sidebarOpen = false"
      @hover-change="sidebarExpanded = $event"
    />
    <div
      class="flex flex-col min-h-screen transition-[padding] duration-300"
      :class="sidebarExpanded ? 'lg:pl-64' : 'lg:pl-16'"
    >
      <AppNavbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="flex-1 p-4 lg:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppSidebar from '../components/AppSidebar.vue'
import AppNavbar from '../components/AppNavbar.vue'

const sidebarOpen = ref(false)
const sidebarExpanded = ref(false)
</script>
