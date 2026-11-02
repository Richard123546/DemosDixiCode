import type { LucideIcon } from 'lucide-react'
import { Children, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Card } from './Card'

interface StatProps {
  icon: LucideIcon
  label: string
  value: string
  hint?: ReactNode
  className?: string
  /** Para valores de texto (un nombre de producto) en lugar de un número. */
  valueClassName?: string
}

/** Indicador principal de una pantalla, con el color de acento del demo. */
export function HeroStat({ icon: Icon, label, value, hint, className }: StatProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-accent-strong p-5 text-white shadow-raised md:p-6',
        className,
      )}
    >
      <p className="flex items-center gap-2 text-sm font-medium text-white/85">
        <Icon className="size-4" />
        {label}
      </p>
      <p key={value} className="mt-2 animate-fade-in text-4xl font-bold tracking-tight tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-2 text-sm text-white/85">{hint}</p>}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, hint, className, valueClassName }: StatProps) {
  return (
    <Card className={cn('p-4 md:p-6', className)}>
      <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Icon className="size-4 shrink-0 text-accent" />
        {label}
      </p>
      <p
        key={value}
        className={cn(
          'mt-2 animate-fade-in text-2xl font-bold tracking-tight text-slate-900 tabular-nums md:text-3xl',
          valueClassName,
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500 md:text-sm">{hint}</p>}
    </Card>
  )
}

/**
 * Grilla de indicadores. El primero (HeroStat) ocupa todo el ancho en móvil;
 * con 4 indicadores también en tablet, y en móvil el último se estira para no quedar huérfano.
 */
export function StatGrid({ children }: { children: ReactNode }) {
  const four = Children.count(children) >= 4
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:gap-5 [&>:first-child]:col-span-2',
        four
          ? 'max-md:[&>:last-child]:col-span-2 md:[&>:first-child]:col-span-3 xl:grid-cols-4 xl:[&>:first-child]:col-span-1'
          : 'md:[&>:first-child]:col-span-1',
      )}
    >
      {children}
    </div>
  )
}
