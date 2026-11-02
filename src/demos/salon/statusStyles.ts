import { CalendarCheck2, CircleCheck, Clock3, type LucideIcon } from 'lucide-react'
import type { AppointmentStatus } from '../../data/salon'

interface StatusStyle {
  label: string
  icon: LucideIcon
  badge: string
  /** Tarjeta en la línea de tiempo */
  card: string
  bar: string
}

export const statusStyles: Record<AppointmentStatus, StatusStyle> = {
  confirmada: {
    label: 'Confirmada',
    icon: CalendarCheck2,
    badge: 'bg-accent-soft text-accent-ink ring-accent-muted',
    card: 'bg-accent-soft border-accent-muted hover:border-accent/40',
    bar: 'bg-accent',
  },
  pendiente: {
    label: 'Pendiente',
    icon: Clock3,
    badge: 'bg-amber-50 text-amber-800 ring-amber-200',
    card: 'bg-amber-50 border-amber-200 border-dashed hover:border-amber-300',
    bar: 'bg-amber-400',
  },
  completada: {
    label: 'Completada',
    icon: CircleCheck,
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    card: 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300',
    bar: 'bg-emerald-500',
  },
}
