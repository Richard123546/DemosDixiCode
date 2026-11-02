import { CalendarClock, Gem, UserRound } from 'lucide-react'
import { useMemo } from 'react'
import type { SearchItem } from '../../components/layout/CommandPalette'
import { sectionSearchItems } from '../../components/layout/searchItems'
import { salonDemo } from '../../data/demos'
import { getService, services } from '../../data/salon'
import { diffDays } from '../../lib/date'
import { formatColones, formatDayTitle, formatDuration, formatTime } from '../../lib/format'
import { useSalon } from './salonStore'

/** Pantallas, clientas, citas por venir y servicios para el buscador global. */
export function useSalonSearch(): SearchItem[] {
  const { clients, appointments, today } = useSalon()
  return useMemo(() => {
    const clientName = new Map(clients.map((c) => [c.id, c.name]))
    const upcoming = appointments
      .filter((a) => a.status !== 'completada' && diffDays(today, a.date) >= 0)
      .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start)

    return [
      ...sectionSearchItems(salonDemo),
      ...clients.map((c) => ({
        id: `clienta-${c.id}`,
        group: 'Clientas',
        title: c.name,
        subtitle: c.phone,
        keywords: c.phone.replace(/\D/g, ''),
        icon: UserRound,
        to: `/salon/clientas?q=${encodeURIComponent(c.name)}`,
      })),
      ...upcoming.map((a) => ({
        id: `cita-${a.id}`,
        group: 'Citas',
        title: `${clientName.get(a.clientId) ?? 'Clienta'} · ${formatTime(a.start)}`,
        subtitle: `${formatDayTitle(a.date, today)} · ${getService(a.serviceId).name}`,
        icon: CalendarClock,
        to: `/salon/agenda?dia=${a.date}`,
      })),
      ...services.map((s) => ({
        id: `servicio-${s.id}`,
        group: 'Servicios',
        title: s.name,
        subtitle: `${s.category} · ${formatColones(s.price)} · ${formatDuration(s.duration)}`,
        icon: Gem,
        to: `/salon/servicios?categoria=${encodeURIComponent(s.category)}`,
      })),
    ]
  }, [clients, appointments, today])
}
