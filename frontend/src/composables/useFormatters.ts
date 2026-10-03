export function useFormatters() {
  function formatDate(dateStr: string | Date): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  function formatShortDate(dateStr: string | Date): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  function formatTime(timeStr: string): string {
    if (!timeStr) return ''
    // Handle ISO date string that contains time
    const date = new Date(timeStr)
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
    }
    return timeStr.substring(0, 5)
  }

  function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return { formatDate, formatShortDate, formatTime, capitalize }
}
