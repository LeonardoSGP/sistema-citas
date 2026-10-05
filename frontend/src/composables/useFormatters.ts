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
    const timeMatch = timeStr.match(/T(\d{2}):(\d{2})|^(\d{2}):(\d{2})/)
    if (timeMatch) return `${timeMatch[1] || timeMatch[3]}:${timeMatch[2] || timeMatch[4]}`
    return timeStr.substring(0, 5)
  }

  function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return { formatDate, formatShortDate, formatTime, capitalize }
}
