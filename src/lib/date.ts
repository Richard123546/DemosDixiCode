/** Fecha local en formato "YYYY-MM-DD". Evita líos de zona horaria con Date. */
export type DateKey = string

const pad = (n: number) => String(n).padStart(2, '0')

export function toDateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function fromDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayKey(): DateKey {
  return toDateKey(new Date())
}

export function addDays(key: DateKey, days: number): DateKey {
  const date = fromDateKey(key)
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

/** Días entre dos fechas (b - a). */
export function diffDays(a: DateKey, b: DateKey): number {
  return Math.round((fromDateKey(b).getTime() - fromDateKey(a).getTime()) / 86_400_000)
}

/** Lunes de la semana de la fecha. */
export function startOfWeek(key: DateKey): DateKey {
  const weekday = (fromDateKey(key).getDay() + 6) % 7
  return addDays(key, -weekday)
}

export function startOfMonth(key: DateKey): DateKey {
  return `${key.slice(0, 7)}-01`
}

export function weekDays(weekStart: DateKey): DateKey[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

/** Minutos desde la medianoche de ahora mismo. */
export function nowMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}
