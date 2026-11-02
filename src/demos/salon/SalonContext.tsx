import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { createSalonMockData, getService, type Appointment, type Client, type PaymentMethod } from '../../data/salon'
import { nowMinutes, todayKey } from '../../lib/date'
import { SalonContext, type NewAppointmentInput } from './salonStore'

export function SalonProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => {
    const today = todayKey()
    return { today, ...createSalonMockData(today) }
  })
  const [clients, setClients] = useState(initial.clients)
  const [appointments, setAppointments] = useState(initial.appointments)
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const [remindedIds, setRemindedIds] = useState<string[]>([])

  const addClient = useCallback((name: string, phone: string) => {
    const client: Client = {
      id: `c-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      since: todayKey(),
      favoriteServiceIds: [],
    }
    setClients((prev) => [...prev, client])
    return client
  }, [])

  const addAppointment = useCallback((input: NewAppointmentInput) => {
    const appointment: Appointment = { id: `n-${Date.now()}`, status: 'confirmada', ...input }
    setAppointments((prev) => [...prev, appointment])
    setLastAddedId(appointment.id)
    window.setTimeout(() => setLastAddedId((current) => (current === appointment.id ? null : current)), 4000)
    return appointment
  }, [])

  const confirmAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'confirmada' } : a)))
  }, [])

  const chargeAppointment = useCallback((id: string, method: PaymentMethod) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'completada',
              payment: { method, amount: getService(a.serviceId).price, paidAt: nowMinutes() },
            }
          : a,
      ),
    )
  }, [])

  const markReminded = useCallback((id: string) => {
    setRemindedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const value = useMemo(
    () => ({
      today: initial.today,
      agendaStart: initial.agendaStart,
      agendaEnd: initial.agendaEnd,
      clients,
      appointments,
      lastAddedId,
      remindedIds,
      addClient,
      addAppointment,
      confirmAppointment,
      chargeAppointment,
      markReminded,
    }),
    [
      initial,
      clients,
      appointments,
      lastAddedId,
      remindedIds,
      addClient,
      addAppointment,
      confirmAppointment,
      chargeAppointment,
      markReminded,
    ],
  )

  return <SalonContext.Provider value={value}>{children}</SalonContext.Provider>
}
