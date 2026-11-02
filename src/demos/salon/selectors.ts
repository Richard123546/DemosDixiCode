import { CLOSE_MINUTE, getService, historicalRevenue, OPEN_MINUTE, staff, type Appointment } from '../../data/salon'
import { addDays, diffDays, type DateKey } from '../../lib/date'

export const endOf = (a: Appointment) => a.start + getService(a.serviceId).duration

export const priceOf = (a: Appointment) => a.payment?.amount ?? getService(a.serviceId).price

export function appointmentsOn(appointments: Appointment[], date: DateKey): Appointment[] {
  return appointments.filter((a) => a.date === date).sort((a, b) => a.start - b.start)
}

/** Primera profesional libre en ese horario, o null si las dos están ocupadas. */
export function findFreeStaff(
  appointments: Appointment[],
  date: DateKey,
  start: number,
  duration: number,
): string | null {
  const end = start + duration
  const busy = new Set(
    appointments.filter((a) => a.date === date && a.start < end && endOf(a) > start).map((a) => a.staffId),
  )
  return staff.find((s) => !busy.has(s.id))?.id ?? null
}

/** Ingreso cobrado en un día. Antes de la agenda se usa el histórico del negocio. */
export function revenueOn(appointments: Appointment[], date: DateKey, agendaStart: DateKey): number {
  if (diffDays(agendaStart, date) < 0) return historicalRevenue(date)
  return appointments.reduce((sum, a) => (a.date === date && a.payment ? sum + a.payment.amount : sum), 0)
}

/**
 * Lo cobrado en un día hasta cierta hora, para comparar "hoy contra ayer a esta hora".
 * Del histórico no hay horas: se toma la parte proporcional del día de trabajo.
 */
export function revenueUntil(appointments: Appointment[], date: DateKey, minute: number, agendaStart: DateKey): number {
  if (diffDays(agendaStart, date) < 0) {
    const share = Math.min(1, Math.max(0, (minute - OPEN_MINUTE) / (CLOSE_MINUTE - OPEN_MINUTE)))
    return Math.round(historicalRevenue(date) * share)
  }
  return appointments.reduce(
    (sum, a) => (a.date === date && a.payment && a.payment.paidAt <= minute ? sum + a.payment.amount : sum),
    0,
  )
}

export function revenueBetween(appointments: Appointment[], from: DateKey, to: DateKey, agendaStart: DateKey): number {
  let total = 0
  for (let d = from; diffDays(d, to) >= 0; d = addDays(d, 1)) total += revenueOn(appointments, d, agendaStart)
  return total
}

export interface ClientStats {
  visits: Appointment[]
  upcoming: Appointment[]
  total: number
  lastVisit: DateKey | null
}

export function clientStats(appointments: Appointment[], clientId: string): ClientStats {
  const own = appointments.filter((a) => a.clientId === clientId)
  const byNewest = (a: Appointment, b: Appointment) => b.date.localeCompare(a.date) || b.start - a.start
  const visits = own.filter((a) => a.status === 'completada').sort(byNewest)
  const upcoming = own.filter((a) => a.status !== 'completada').sort((a, b) => byNewest(b, a))
  return {
    visits,
    upcoming,
    total: visits.reduce((sum, a) => sum + priceOf(a), 0),
    lastVisit: visits[0]?.date ?? null,
  }
}
