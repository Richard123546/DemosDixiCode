import { diffDays, fromDateKey, type DateKey } from './date'

const NBSP = '\u00A0'

/** Formatea un monto en colones: 12500 → "₡12 500" (espacio sin salto como separador de miles). */
export function formatColones(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  const digits = Math.round(Math.abs(amount)).toString()
  return `${sign}₡${digits.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)}`
}

/** En Costa Rica se dice "setiembre". */
const tico = (text: string) => text.replace(/septiembre/g, 'setiembre').replace(/\bsept\b/g, 'set')

const longDate = new Intl.DateTimeFormat('es-CR', { weekday: 'long', day: 'numeric', month: 'long' })
const shortDate = new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short' })
const weekdayShort = new Intl.DateTimeFormat('es-CR', { weekday: 'short' })
const monthName = new Intl.DateTimeFormat('es-CR', { month: 'long' })
const monthYear = new Intl.DateTimeFormat('es-CR', { month: 'long', year: 'numeric' })

/** "jueves 23 de octubre" */
export function formatLongDate(date: Date): string {
  return tico(longDate.format(date))
}

/** "23 oct" */
export function formatShortDate(key: DateKey): string {
  return tico(shortDate.format(fromDateKey(key))).replace('.', '')
}

/** "lun" */
export function formatWeekdayShort(key: DateKey): string {
  return weekdayShort.format(fromDateKey(key)).replace('.', '')
}

/** "octubre" */
export function formatMonthName(key: DateKey): string {
  return tico(monthName.format(fromDateKey(key)))
}

/** "agosto de 2024" */
export function formatMonthYear(key: DateKey): string {
  return tico(monthYear.format(fromDateKey(key)))
}

/** "Hoy", "Mañana", "Ayer" o "jueves 23 de octubre". */
export function formatDayTitle(key: DateKey, today: DateKey): string {
  const diff = diffDays(today, key)
  const label = formatLongDate(fromDateKey(key))
  if (diff === 0) return `Hoy, ${label}`
  if (diff === 1) return `Mañana, ${label}`
  if (diff === -1) return `Ayer, ${label}`
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** "Hoy", "Ayer", "Hace 5 días", "Hace 2 semanas", "Hace 3 meses". */
export function formatRelativeDay(key: DateKey, today: DateKey): string {
  const days = diffDays(key, today)
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 0) return days === -1 ? 'Mañana' : `En ${-days} días`
  if (days < 7) return `Hace ${days} días`
  if (days < 30) {
    const weeks = Math.round(days / 7)
    return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
  }
  const months = Math.round(days / 30)
  return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`
}

/** 870 → "2:30 p. m." */
export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const suffix = h < 12 ? 'a.' + NBSP + 'm.' : 'p.' + NBSP + 'm.'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}${NBSP}${suffix}`
}

/** 14 → "2 p. m." */
export function formatHour(hour: number): string {
  return `${hour % 12 || 12}${NBSP}${hour < 12 ? 'a.' + NBSP + 'm.' : 'p.' + NBSP + 'm.'}`
}

/** 90 → "1 h 30 min" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return `${m}${NBSP}min`
  return m ? `${h}${NBSP}h ${m}${NBSP}min` : `${h}${NBSP}h`
}

/** Tiempo transcurrido: "Recién", "6 min", "1 h 05 min". */
export function formatElapsed(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60_000))
  if (minutes < 1) return 'Recién'
  if (minutes < 60) return `${minutes}${NBSP}min`
  return `${Math.floor(minutes / 60)}${NBSP}h ${String(minutes % 60).padStart(2, '0')}${NBSP}min`
}

/** Hora de un timestamp: "12:45 p. m." */
export function formatClock(timestamp: number): string {
  const date = new Date(timestamp)
  return formatTime(date.getHours() * 60 + date.getMinutes())
}

/** Saludo según la hora: "Buenos días", "Buenas tardes" o "Buenas noches". */
export function greeting(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Buenos días'
  return hour < 19 ? 'Buenas tardes' : 'Buenas noches'
}
