export function useFormatters() {
  function formatDate(dateStr: string | Date): string {
    if (!dateStr) return ''
    const date = parseCalendarDate(dateStr)
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  function formatShortDate(dateStr: string | Date): string {
    if (!dateStr) return ''
    const date = parseCalendarDate(dateStr)
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  function parseCalendarDate(dateValue: string | Date): Date {
    if (dateValue instanceof Date) return dateValue
    const datePart = dateValue.substring(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [year, month, day] = datePart.split('-').map(Number)
      return new Date(year, month - 1, day)
    }
    return new Date(dateValue)
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
