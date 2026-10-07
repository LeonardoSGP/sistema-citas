export function useFormatters() {
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]

  function getCalendarParts(dateValue: string | Date) {
    if (dateValue instanceof Date) {
      return {
        year: dateValue.getFullYear(),
        month: dateValue.getMonth() + 1,
        day: dateValue.getDate(),
      }
    }

    const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      return {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
      }
    }

    const date = new Date(dateValue)
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    }
  }

  function formatDate(dateStr: string | Date): string {
    if (!dateStr) return ''
    const { year, month, day } = getCalendarParts(dateStr)
    return `${day} de ${monthNames[month - 1]} de ${year}`
  }

  function formatShortDate(dateStr: string | Date): string {
    if (!dateStr) return ''
    const { year, month, day } = getCalendarParts(dateStr)
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
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
