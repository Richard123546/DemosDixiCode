import type { AppointmentStatus } from '../../data/salon'
import { cn } from '../../lib/cn'
import { statusStyles } from './statusStyles'

export function StatusBadge({ status, className }: { status: AppointmentStatus; className?: string }) {
  const style = statusStyles[status]
  const Icon = style.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
        style.badge,
        className,
      )}
    >
      <Icon className="size-3.5" />
      {style.label}
    </span>
  )
}
