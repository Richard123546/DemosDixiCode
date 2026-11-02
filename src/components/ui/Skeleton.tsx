import { cn } from '../../lib/cn'

/** Bloque gris con brillo que se mueve, mientras "carga" una pantalla. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-shimmer rounded-xl bg-[linear-gradient(90deg,var(--color-slate-100)_0%,var(--color-slate-200)_50%,var(--color-slate-100)_100%)] bg-[length:200%_100%]',
        className,
      )}
    />
  )
}

/** Silueta genérica de una pantalla: título, indicadores y dos tarjetas. */
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Cargando" className="animate-fade-in">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className={cn('h-28 rounded-2xl', i === 0 && 'max-md:col-span-2')} />
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:mt-5 xl:grid-cols-5">
        <Skeleton className="h-64 rounded-2xl xl:col-span-3" />
        <Skeleton className="h-64 rounded-2xl xl:col-span-2" />
      </div>
    </div>
  )
}
