import { useId, useState } from 'react'
import { cn } from '../../lib/cn'
import { formatColones } from '../../lib/format'

export interface MiniDatum {
  key: string
  label: string
  /** Texto al pasar el dedo o el mouse: "Lunes 27 oct". */
  title: string
  value: number
}

const W = 300
const H = 100
const PAD = 8

/**
 * Gráfico de área compacto en colones, con el punto actual resaltado y detalle al tocar.
 * Dentro de una tarjeta flex crece para llenar el alto disponible.
 */
export function MiniAreaChart({ data, label, className }: { data: MiniDatum[]; label: string; className?: string }) {
  const gradientId = useId()
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(...data.map((d) => d.value), 1)
  const step = data.length > 1 ? W / (data.length - 1) : 0
  const points = data.map((d, i) => [i * step, PAD + (1 - d.value / max) * (H - PAD * 2)] as const)
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const shown = active ?? data.length - 1
  const [dotX, dotY] = points[shown] ?? [0, 0]

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col', className)}>
      <p className="h-5 text-xs text-slate-500" aria-live="polite">
        <span className="font-medium text-slate-700">{data[shown]?.title}</span>
        {data[shown] && <> · {formatColones(data[shown].value)}</>}
      </p>
      <div className="relative mt-2 min-h-28 flex-1" role="img" aria-label={label} onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="[stop-color:var(--accent)] [stop-opacity:0.28]" />
              <stop offset="100%" className="[stop-color:var(--accent)] [stop-opacity:0]" />
            </linearGradient>
          </defs>
          <path d={`${line} L${W},${H} L0,${H} Z`} fill={`url(#${gradientId})`} />
          <path
            d={line}
            className="stroke-accent"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {/* El punto va en HTML para que no se deforme con el ancho del gráfico. */}
        <span
          className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-4 ring-accent/20 transition-[left,top] duration-200"
          style={{ left: `${(dotX / W) * 100}%`, top: `${(dotY / H) * 100}%` }}
        />
        <div className="absolute inset-0 flex">
          {data.map((d, i) => (
            <button
              key={d.key}
              type="button"
              aria-label={`${d.title}: ${formatColones(d.value)}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className="h-full flex-1 focus-visible:outline-none"
            />
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-slate-400">
        {data.map((d, i) => (
          <span key={d.key} className={cn('w-0 flex-1 text-center first:text-left last:text-right', i === shown && 'font-semibold text-slate-700')}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}
