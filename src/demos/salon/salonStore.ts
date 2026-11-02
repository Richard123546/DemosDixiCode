import { createContext, useContext, useMemo } from 'react'
import type { Appointment, Client, PaymentMethod } from '../../data/salon'
import type { DateKey } from '../../lib/date'

export interface NewAppointmentInput {
  clientId: string
  serviceId: string
  date: DateKey
  start: number
  staffId: string
}

export interface SalonContextValue {
  today: DateKey
  agendaStart: DateKey
  agendaEnd: DateKey
  clients: Client[]
  appointments: Appointment[]
  /** Última cita creada, para resaltarla en la agenda. */
  lastAddedId: string | null
  /** Citas a las que ya se les mandó recordatorio por WhatsApp. */
  remindedIds: string[]
  addClient: (name: string, phone: string) => Client
  addAppointment: (input: NewAppointmentInput) => Appointment
  confirmAppointment: (id: string) => void
  chargeAppointment: (id: string, method: PaymentMethod) => void
  markReminded: (id: string) => void
}

export const SalonContext = createContext<SalonContextValue | null>(null)

export function useSalon(): SalonContextValue {
  const value = useContext(SalonContext)
  if (!value) throw new Error('useSalon debe usarse dentro de SalonProvider')
  return value
}

export function useClientMap(): Map<string, Client> {
  const { clients } = useSalon()
  return useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients])
}
