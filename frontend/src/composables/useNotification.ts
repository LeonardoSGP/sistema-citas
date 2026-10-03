import { ref } from 'vue'

interface Notification {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

const notifications = ref<Notification[]>([])
let nextId = 1

export function useNotification() {
  function show(message: string, type: Notification['type'] = 'info') {
    const id = nextId++
    notifications.value.push({ id, type, message })
    setTimeout(() => {
      notifications.value = notifications.value.filter((n) => n.id !== id)
    }, 4000)
  }

  const success = (message: string) => show(message, 'success')
  const error = (message: string) => show(message, 'error')
  const warning = (message: string) => show(message, 'warning')
  const info = (message: string) => show(message, 'info')

  function remove(id: number) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  return { notifications, success, error, warning, info, remove }
}
