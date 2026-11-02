import { cn } from '../../lib/cn'
import type { TableStatus } from './selectors'
import { tableStatusStyles } from './tableStatusStyles'

export function TableStatusBadge({ status, className }: { status: TableStatus; className?: string }) {
  const style = tableStatusStyles[status]
  const Icon = style.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset',
        style.badge,
        className,
      )}
    >
      <Icon className="size-3.5" />
      {style.label}
    </span>
  )
}
