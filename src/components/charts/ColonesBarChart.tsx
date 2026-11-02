import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatColones } from '../../lib/format'

export interface BarDatum {
  key: string
  label: string
  /** Texto del tooltip, por ejemplo "Semana del 12 oct". */
  title: string
  value: number
  /** Barra resaltada (hoy, esta semana). */
  current?: boolean
}

/** Eje en colones abreviado: "90 mil", "1,4 M". */
function axisColones(value: number): string {
  if (!value) return '0'
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString('es-CR', { maximumFractionDigits: 2 })} M`
  return `${Math.round(value / 1000)} mil`
}

/** Gráfico de barras de una sola serie en colones, con el período actual resaltado. */
export function ColonesBarChart({ data, label }: { data: BarDatum[]; label: string }) {
  return (
    <div className="h-60 md:h-72" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap="26%">
          <CartesianGrid vertical={false} stroke="var(--color-slate-100)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={0}
            tick={{ fill: 'var(--color-slate-500)', fontSize: 11 }}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: 'var(--color-slate-400)', fontSize: 11 }}
            tickFormatter={axisColones}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-slate-50)' }}
            content={({ active, payload }) => {
              const datum = payload?.[0]?.payload as BarDatum | undefined
              if (!active || !datum) return null
              return (
                <div className="rounded-xl border border-slate-200 bg-surface px-3 py-2 shadow-raised">
                  <p className="text-xs text-slate-500">{datum.title}</p>
                  <p className="text-sm font-semibold text-slate-900 tabular-nums">{formatColones(datum.value)}</p>
                </div>
              )
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={44} animationDuration={600}>
            {data.map((d) => (
              <Cell key={d.key} fill={d.current ? 'var(--accent)' : 'color-mix(in oklab, var(--accent) 32%, var(--surface))'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
