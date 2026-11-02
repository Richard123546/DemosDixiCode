import { Check, ChefHat, CircleCheck, Timer } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { useToast } from '../../components/ui/toastContext'
import { getMenuItem, type KitchenTicket } from '../../data/soda'
import { cn } from '../../lib/cn'
import { formatClock, formatElapsed } from '../../lib/format'
import { useNow } from '../../lib/useNow'
import { linesCount, pendingTickets } from './selectors'
import { useSoda } from './sodaStore'

const MIN = 60_000

function urgency(elapsed: number) {
  if (elapsed >= 15 * MIN) return 'bg-red-50 text-red-700 ring-red-200'
  if (elapsed >= 10 * MIN) return 'bg-amber-50 text-amber-800 ring-amber-200'
  return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
}

export default function CocinaPage() {
  const { tickets, markReady } = useSoda()
  const toast = useToast()
  const now = useNow(10_000)

  const pending = pendingTickets(tickets).sort((a, b) => a.createdAt - b.createdAt)
  const recent = tickets
    .filter((t) => t.readyAt)
    .sort((a, b) => b.readyAt! - a.readyAt!)
    .slice(0, 4)

  const ready = (ticket: KitchenTicket) => {
    markReady(ticket.id)
    toast(`Mesa ${ticket.tableId}: comanda lista`, `#${ticket.number} · ${linesCount(ticket.lines)} productos para servir`)
  }

  const oldest = pending[0] ? now - pending[0].createdAt : 0

  return (
    <>
      <PageHeader
        title="Cocina"
        description={
          pending.length
            ? `${pending.length} ${pending.length === 1 ? 'comanda pendiente' : 'comandas pendientes'} · la más vieja lleva ${formatElapsed(oldest)}`
            : 'Todo lo que entra desde Pedido aparece aquí.'
        }
      />

      {pending.length === 0 ? (
        <Card>
          <EmptyState icon={ChefHat} title="Cocina al día" description="No hay comandas pendientes. Las nuevas aparecen aquí al instante." />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3 xl:gap-5 2xl:grid-cols-4">
          {pending.map((ticket) => {
            const elapsed = now - ticket.createdAt
            return (
              <Card key={ticket.id} className="flex animate-pop-in flex-col overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-xl font-bold text-slate-900">Mesa {ticket.tableId}</p>
                    <p className="text-xs text-slate-500">
                      Comanda #{ticket.number} · entró {formatClock(ticket.createdAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold whitespace-nowrap tabular-nums ring-1 ring-inset',
                      urgency(elapsed),
                    )}
                  >
                    <Timer className={cn('size-4', elapsed >= 15 * MIN && 'animate-pulse')} />
                    {formatElapsed(elapsed)}
                  </span>
                </div>
                <ul className="flex-1 space-y-2 px-4 py-3">
                  {ticket.lines.map((line) => (
                    <li key={line.itemId} className="flex items-baseline gap-3">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-sm font-bold text-accent-ink tabular-nums">
                        {line.qty}
                      </span>
                      <span className="text-[15px] font-medium text-slate-800">{getMenuItem(line.itemId).name}</span>
                    </li>
                  ))}
                </ul>
                <div className="px-4 pb-4">
                  <button
                    type="button"
                    onClick={() => ready(ticket)}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-semibold text-white shadow-card transition-all hover:bg-emerald-700 active:scale-[0.98]"
                  >
                    <Check className="size-5" />
                    Listo
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {recent.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">Listas recientemente</h2>
          <Card className="divide-y divide-slate-100">
            {recent.map((ticket) => (
              <div key={ticket.id} className="flex animate-fade-in items-center gap-3 px-4 py-3">
                <CircleCheck className="size-5 shrink-0 text-emerald-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    Mesa {ticket.tableId} <span className="text-slate-400">· #{ticket.number}</span>
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {ticket.lines.map((l) => `${l.qty} ${getMenuItem(l.itemId).name}`).join(', ')}
                  </p>
                </div>
                <p className="text-right text-xs whitespace-nowrap text-slate-500">
                  {formatClock(ticket.readyAt!)}
                  <span className="block text-slate-400">
                    {ticket.readyAt! - ticket.createdAt < MIN
                      ? 'en menos de 1 min'
                      : `en ${formatElapsed(ticket.readyAt! - ticket.createdAt)}`}
                  </span>
                </p>
              </div>
            ))}
          </Card>
        </section>
      )}
    </>
  )
}
