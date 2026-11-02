import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { cn } from '../../lib/cn'

interface TrendBadgeProps {
  current: number
  previous: number
  /** Contra qué se compara: "vs. ayer", "vs. ayer a esta hora"… */
  label: string
  /** Sobre el fondo de color del indicador principal. */
  onAccent?: boolean
}

/** Flecha de tendencia con el cambio en porcentaje. */
export function TrendBadge({ current, previous, label, onAccent }: TrendBadgeProps) {
  const change = previous ? (current - previous) / previous : current ? 1 : 0
  const percent = Math.round(Math.abs(change) * 100)
  const direction = percent === 0 ? 'flat' : change > 0 ? 'up' : 'down'
  const Icon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : ArrowRight

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums',
          onAccent
            ? 'bg-white/20 text-white'
            : direction === 'up'
              ? 'bg-emerald-50 text-emerald-700'
              : direction === 'down'
                ? 'bg-red-50 text-red-700'
                : 'bg-slate-100 text-slate-600',
        )}
      >
        <Icon className="size-3.5" strokeWidth={2.5} aria-hidden />
        <span className="sr-only">{direction === 'up' ? 'Subió' : direction === 'down' ? 'Bajó' : 'Igual'}</span>
        {percent}%
      </span>
      <span className={onAccent ? 'text-white/85' : 'text-slate-500'}>{label}</span>
    </span>
  )
}
