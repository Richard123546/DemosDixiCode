import { paymentMethods, type PaymentMethod } from '../../data/payments'
import { cn } from '../../lib/cn'
import { paymentIcons } from './paymentIcons'

interface PaymentMethodPickerProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
}

export function PaymentMethodPicker({ value, onChange }: PaymentMethodPickerProps) {
  return (
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
