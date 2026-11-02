import { CircleAlert, PackageX } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { StockStatus } from './selectors'

export function StockBadge({ status, className }: { status: StockStatus; className?: string }) {
  if (status === 'ok') return null
  const out = status === 'agotado'
  const Icon = out ? PackageX : CircleAlert
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
        out ? 'bg-slate-900 text-slate-50' : 'bg-red-600 text-white',
        className,
      )}
    >
      <Icon className="size-3.5" />
      {out ? 'Agotado' : 'Poco stock'}
    </span>
  )
}
