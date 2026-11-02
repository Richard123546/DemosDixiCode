import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Fila que se desliza horizontalmente en móvil y se acomoda en varias líneas desde tablet. */
const row = '-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0'

interface FilterChipsProps<T extends string | number> {
  options: Array<{ value: T; label: ReactNode }>
  value: T | undefined
  onChange: (value: T) => void
  label: string
  className?: string
}

/** Selector de una opción (categoría, mesa…). */
export function FilterChips<T extends string | number>({ options, value, onChange, label, className }: FilterChipsProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn(row, className)}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-all duration-200',
              selected
                ? 'bg-slate-900 text-slate-50 shadow-card'
                : 'border border-slate-200 bg-surface text-slate-600 hover:border-slate-300 hover:text-slate-900',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/** Resumen corto en píldoras: "8 citas · 4 completadas…". */
export function InfoChips({ items, className }: { items: Array<string | null | false>; className?: string }) {
  return (
    <div className={cn(row, className)}>
      {items.filter(Boolean).map((item) => (
        <span
          key={item as string}
          className="shrink-0 rounded-full border border-slate-200 bg-surface px-3 py-1.5 text-xs font-medium whitespace-nowrap text-slate-600"
        >
          {item}
        </span>
      ))}
    </div>
  )
}
