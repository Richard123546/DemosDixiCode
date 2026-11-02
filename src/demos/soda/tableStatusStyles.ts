import { Armchair, Receipt, Utensils, type LucideIcon } from 'lucide-react'
import type { TableStatus } from './selectors'

export const tableStatusStyles: Record<TableStatus, { label: string; icon: LucideIcon; badge: string; dot: string }> = {
  libre: {
    label: 'Libre',
    icon: Armchair,
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dot: 'bg-emerald-500',
  },
  ocupada: {
    label: 'Ocupada',
    icon: Utensils,
    badge: 'bg-accent-soft text-accent-ink ring-accent-muted',
    dot: 'bg-accent',
  },
  'por-cobrar': {
    label: 'Por cobrar',
    icon: Receipt,
    badge: 'bg-sky-50 text-sky-700 ring-sky-200',
    dot: 'bg-sky-500',
  },
}
