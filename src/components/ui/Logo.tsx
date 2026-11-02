import { cn } from '../../lib/cn'

interface LogoProps {
  size?: 'sm' | 'lg'
  className?: string
}

export function Logo({ size = 'sm', className }: LogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-bold tracking-tight text-slate-900',
        size === 'lg' ? 'text-3xl' : 'text-lg',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'grid place-items-center rounded-lg bg-indigo-600 font-extrabold text-white shadow-card',
          size === 'lg' ? 'size-10 text-xl' : 'size-7 text-sm',
        )}
      >
        D
      </span>
      <span>
        Dixi<span className="text-indigo-600">Code</span>
      </span>
    </span>
  )
}
