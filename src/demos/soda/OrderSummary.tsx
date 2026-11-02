import { ChefHat, ClipboardList, Receipt, Send } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { getMenuItem, type KitchenTicket, type Table } from '../../data/soda'
import { cn } from '../../lib/cn'
import { formatColones } from '../../lib/format'
import { linesCount, linesTotal, pendingTickets, unsentCount } from './selectors'

interface OrderSummaryProps {
  table: Table
  tickets: KitchenTicket[]
  onSend: () => void
  onCharge: () => void
  className?: string
}

export function OrderSummary({ table, tickets, onSend, onCharge, className }: OrderSummaryProps) {
  const unsent = unsentCount(table)
  const cooking = new Set(pendingTickets(tickets, table.id).flatMap((t) => t.lines.map((l) => l.itemId)))
  const total = linesTotal(table.lines)

  if (table.lines.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Mesa sin pedido"
        description="Agregá platos del menú con el botón +."
        className={cn('py-10', className)}
      />
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <ul className="divide-y divide-slate-100">
        {table.lines.map((line) => {
          const item = getMenuItem(line.itemId)
          const fresh = line.qty - line.sent
          return (
            <li key={line.itemId} className="flex animate-fade-in items-start gap-3 py-2.5">
              <span className="w-7 shrink-0 text-sm font-semibold text-slate-900 tabular-nums">{line.qty}×</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-slate-900">{item.name}</span>
                <span
                  className={cn(
                    'mt-0.5 inline-flex items-center gap-1 text-xs',
                    fresh > 0 ? 'font-medium text-amber-700' : 'text-slate-400',
                  )}
                >
                  {fresh > 0 ? (
                    <>
                      <span className="size-1.5 rounded-full bg-amber-500" />
                      {fresh === line.qty ? 'Nuevo' : `${fresh} nuevo${fresh > 1 ? 's' : ''}`}
                    </>
                  ) : cooking.has(line.itemId) ? (
                    <>
                      <ChefHat className="size-3" /> En cocina
                    </>
                  ) : (
                    'Servido'
                  )}
                </span>
              </span>
              <span className="text-sm font-semibold text-slate-700 tabular-nums">
                {formatColones(line.qty * item.price)}
              </span>
            </li>
          )
        })}
      </ul>

      <div className="mt-3 flex items-end justify-between border-t border-slate-200 pt-4">
        <div>
          <p className="text-sm text-slate-500">{linesCount(table.lines)} productos · IVA incluido</p>
          <p className="text-sm font-medium text-slate-700">Total</p>
        </div>
        <p key={total} className="animate-fade-in text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
          {formatColones(total)}
        </p>
      </div>

      <div className="mt-4 grid gap-2">
        <Button variant={unsent > 0 ? 'accent' : 'secondary'} size="lg" onClick={onSend} disabled={unsent === 0}>
          <Send className="size-5" />
          {unsent > 0 ? `Enviar a cocina (${unsent})` : 'Todo enviado a cocina'}
        </Button>
        <Button variant="dark" size="lg" onClick={onCharge} disabled={unsent > 0}>
          <Receipt className="size-5" />
          Registrar pago de {formatColones(total)}
        </Button>
        {unsent > 0 && <p className="text-center text-xs text-slate-500">Enviá los platos nuevos antes de cobrar.</p>}
      </div>
    </div>
  )
}
