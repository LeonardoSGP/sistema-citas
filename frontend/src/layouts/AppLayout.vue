<template>
  <div class="min-h-screen bg-slate-50">
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="lg:pl-64 flex flex-col min-h-screen">
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
</script>
