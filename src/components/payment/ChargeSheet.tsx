import { useState, type ReactNode } from 'react'
import type { PaymentMethod } from '../../data/payments'
import { cn } from '../../lib/cn'
import { formatColones } from '../../lib/format'
import { Button } from '../ui/Button'
import { Input } from '../ui/Field'
import { Sheet } from '../ui/Sheet'
import { PaymentMethodPicker } from './PaymentMethodPicker'

interface ChargeSheetProps {
  open: boolean
  title: string
  description?: string
  total: number
  /** Texto con la cuenta de SINPE Móvil del negocio. */
  sinpeNote?: ReactNode
  onClose: () => void
  onConfirm: (method: PaymentMethod) => void
}

/** Cobro con método de pago y cálculo de vuelto en efectivo. */
export function ChargeSheet({ open, ...props }: ChargeSheetProps) {
  if (!open) return null
  return <ChargeForm {...props} />
}

function ChargeForm({ title, description, total, sinpeNote, onClose, onConfirm }: Omit<ChargeSheetProps, 'open'>) {
  const [method, setMethod] = useState<PaymentMethod>('efectivo')
  const [cash, setCash] = useState('')

  const paid = cash ? Number(cash.replace(/\D/g, '')) : total
  const change = paid - total
  const quickAmounts = [5000, 10000, 20000].filter((amount) => amount > total).slice(0, 2)
  const missing = method === 'efectivo' && change < 0

  return (
    <Sheet
      open
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <Button variant="accent" size="lg" className="w-full" disabled={missing} onClick={() => onConfirm(method)}>
          Confirmar cobro de {formatColones(total)}
        </Button>
      }
    >
      <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center">
        <p className="text-sm text-slate-500">Total a cobrar</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-slate-900 tabular-nums">{formatColones(total)}</p>
        <p className="mt-1 text-sm text-slate-500">IVA incluido</p>
      </div>

      <p className="mt-5 mb-2 text-sm font-medium text-slate-700">¿Cómo paga?</p>
      <PaymentMethodPicker value={method} onChange={setMethod} />

      {method === 'efectivo' && (
        <div className="mt-4 animate-fade-in">
          <label htmlFor="cash" className="mb-1.5 block text-sm font-medium text-slate-700">
            Paga con
          </label>
          <Input
            id="cash"
            inputMode="numeric"
            placeholder={`Monto exacto (${formatColones(total)})`}
            value={cash ? formatColones(Number(cash)) : ''}
            onChange={(e) => setCash(e.target.value.replace(/\D/g, ''))}
          />
          <div className="mt-2 flex gap-2">
            {[{ label: 'Exacto', value: '' }, ...quickAmounts.map((a) => ({ label: formatColones(a), value: String(a) }))].map(
              (option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setCash(option.value)}
                  className={cn(
                    'h-9 flex-1 rounded-lg border text-sm font-medium transition-colors',
                    cash === option.value
                      ? 'border-accent bg-accent-soft text-accent-ink'
                      : 'border-slate-200 bg-surface text-slate-600 hover:border-slate-300',
                  )}
                >
                  {option.label}
                </button>
              ),
            )}
          </div>
          <div
            className={cn(
              'mt-3 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium',
              missing ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800',
            )}
          >
            <span>{missing ? 'Falta' : 'Vuelto'}</span>
            <span className="text-lg font-bold tabular-nums">{formatColones(Math.abs(change))}</span>
          </div>
        </div>
      )}
      {method === 'sinpe' && sinpeNote && <p className="mt-3 text-sm text-slate-500">{sinpeNote}</p>}
    </Sheet>
  )
}
