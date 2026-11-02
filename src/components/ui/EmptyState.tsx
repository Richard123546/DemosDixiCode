import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex animate-fade-in flex-col items-center px-6 py-12 text-center', className)}>
      <div className="relative h-28 w-40" aria-hidden>
        <Illustration />
        <span className="absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 animate-pop-in place-items-center rounded-2xl bg-surface text-accent shadow-raised ring-1 ring-accent-muted">
          <Icon className="size-7" strokeWidth={1.8} />
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Escena de fondo: mancha suave, dos hojas inclinadas y destellos, todo con el color del demo. */
function Illustration() {
  return (
    <svg viewBox="0 0 160 112" className="absolute inset-0 size-full" fill="none">
      <path
        d="M30 62c-6-24 14-46 42-50 27-4 55 6 62 28 8 24-6 52-36 58-31 7-62-11-68-36Z"
        className="fill-accent-soft"
      />
      <g className="text-slate-200" stroke="currentColor" strokeWidth="1.5">
        <rect x="26" y="34" width="44" height="54" rx="8" transform="rotate(-10 48 61)" className="fill-surface" />
        <rect x="90" y="30" width="44" height="54" rx="8" transform="rotate(9 112 57)" className="fill-surface" />
      </g>
      <g className="text-slate-200" fill="currentColor">
        <rect x="32" y="66" width="22" height="4" rx="2" transform="rotate(-10 43 68)" />
        <rect x="34" y="75" width="14" height="4" rx="2" transform="rotate(-10 41 77)" />
        <rect x="104" y="64" width="22" height="4" rx="2" transform="rotate(9 115 66)" />
        <rect x="102" y="73" width="14" height="4" rx="2" transform="rotate(9 109 75)" />
      </g>
      <g className="fill-accent">
        <path d="M18 24l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" opacity=".55" />
        <path d="M144 14l1.5 3.5L149 19l-3.5 1.5L144 24l-1.5-3.5L139 19l3.5-1.5L144 14Z" opacity=".4" />
        <circle cx="140" cy="96" r="3" opacity=".3" />
        <circle cx="16" cy="92" r="2" opacity=".35" />
      </g>
    </svg>
  )
}
