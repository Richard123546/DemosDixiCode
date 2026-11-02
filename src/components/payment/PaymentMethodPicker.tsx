import { Smartphone } from 'lucide-react'
import { paymentMethods, type PaymentMethod } from '../../data/payments'
import { cn } from '../../lib/cn'
import { useDemo } from '../layout/DemoContext'
import { paymentIcons } from './paymentIcons'

interface PaymentMethodPickerProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
}

/**
 * Métodos de pago con la aclaración de que el sistema solo registra el pago,
 * y el número de SINPE Móvil del negocio a la vista cuando se elige ese método.
 */
export function PaymentMethodPicker({ value, onChange }: PaymentMethodPickerProps) {
  const demo = useDemo()
  return (
    <div>
      <div role="radiogroup" aria-label="Método de pago" className="grid grid-cols-3 gap-2">
        {(Object.keys(paymentMethods) as PaymentMethod[]).map((method) => {
          const Icon = paymentIcons[method]
          const selected = method === value
          return (
            <button
              key={method}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(method)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-sm font-medium transition-all',
                selected
                  ? 'border-accent bg-accent-soft text-accent-ink ring-2 ring-accent/20'
                  : 'border-slate-200 bg-surface text-slate-600 hover:border-slate-300',
              )}
            >
              <Icon className="size-5" />
              {paymentMethods[method]}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        El pago se recibe como siempre; el sistema lo registra para el cierre de caja.
      </p>
      {value === 'sinpe' && (
        <div className="mt-3 flex animate-fade-in items-center gap-3 rounded-xl border border-accent-muted bg-accent-soft/60 px-4 py-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface text-accent shadow-card">
            <Smartphone className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs text-slate-500">SINPE Móvil del negocio</span>
            <span className="block text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{demo.phone}</span>
            <span className="block truncate text-xs text-slate-600">A nombre de {demo.businessName}</span>
          </span>
        </div>
      )}
    </div>
  )
}

export function PaymentMethodLabel({ method }: { method: PaymentMethod }) {
  const Icon = paymentIcons[method]
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <Icon className="size-3.5" />
      {paymentMethods[method]}
    </span>
  )
}
