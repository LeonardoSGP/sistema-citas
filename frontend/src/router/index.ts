import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/',
      component: () => import('../layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', name: 'Dashboard', component: () => import('../views/DashboardView.vue') },
        { path: 'patients', name: 'Patients', component: () => import('../views/patients/PatientsView.vue') },
        { path: 'patients/new', name: 'NewPatient', component: () => import('../views/patients/PatientFormView.vue') },
        { path: 'patients/:id/edit', name: 'EditPatient', component: () => import('../views/patients/PatientFormView.vue') },
        { path: 'patients/:id/expediente', name: 'PatientExpediente', component: () => import('../views/patients/PatientExpedienteView.vue') },
        { path: 'appointments', name: 'Appointments', component: () => import('../views/appointments/AppointmentsView.vue') },
        { path: 'appointments/new', name: 'NewAppointment', component: () => import('../views/appointments/AppointmentFormView.vue') },
        { path: 'appointments/:id/edit', name: 'EditAppointment', component: () => import('../views/appointments/AppointmentFormView.vue') },
        { path: 'appointments/:id', name: 'AppointmentDetail', component: () => import('../views/appointments/AppointmentDetailView.vue') },
        { path: 'session-notes', name: 'SessionNotes', component: () => import('../views/sessionNotes/SessionNotesView.vue') },
        { path: 'session-notes/new', name: 'NewSessionNote', component: () => import('../views/sessionNotes/SessionNoteFormView.vue') },
        { path: 'session-notes/:id/edit', name: 'EditSessionNote', component: () => import('../views/sessionNotes/SessionNoteFormView.vue') },
        { path: 'settings', name: 'Settings', component: () => import('../views/SettingsView.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) return '/login'
  if (to.meta.requiresGuest && authStore.isAuthenticated) return '/dashboard'
  if (authStore.isAuthenticated && !authStore.user) await authStore.fetchProfile()
})

export default router
