import { ChefHat, Clock, Plus, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { InfoChips } from '../../components/ui/Chips'
import { PageHeader } from '../../components/ui/PageHeader'
import { cn } from '../../lib/cn'
import { formatColones, formatElapsed } from '../../lib/format'
import { useNow } from '../../lib/useNow'
import { linesCount, linesTotal, pendingTickets, tableStatus, unsentCount } from './selectors'
import { useSoda } from './sodaStore'
import { TableStatusBadge } from './TableStatusBadge'

export default function MesasPage() {
  const { tables, tickets } = useSoda()
  const navigate = useNavigate()
  const now = useNow()

  const rows = tables.map((table) => ({ table, status: tableStatus(table, tickets) }))
  const occupied = rows.filter((r) => r.status !== 'libre')
  const openTotal = occupied.reduce((sum, r) => sum + linesTotal(r.table.lines), 0)
  const count = (status: string) => rows.filter((r) => r.status === status).length

  return (
    <>
      <PageHeader title="Mesas" description="Tocá una mesa para ver o agregar a su pedido." />

      <InfoChips
        className="mb-5"
        items={[
          `${count('ocupada')} ocupadas`,
          `${count('por-cobrar')} por cobrar`,
          `${count('libre')} libres`,
          `${formatColones(openTotal)} en mesas abiertas`,
        ]}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 xl:gap-5">
        {rows.map(({ table, status }) => {
          const total = linesTotal(table.lines)
          const inKitchen = pendingTickets(tickets, table.id).length
          const unsent = unsentCount(table)
          const isFree = status === 'libre'
          return (
            <button
              key={table.id}
              type="button"
              onClick={() => navigate(`/soda/pedido?mesa=${table.id}`)}
              className={cn(
                'group relative flex min-h-40 flex-col rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised active:scale-[0.98] md:min-h-44 md:p-5',
                isFree
                  ? 'border-dashed border-slate-300 bg-surface/60 hover:border-emerald-300 hover:bg-surface'
                  : 'border-slate-200/80 bg-surface shadow-card',
                status === 'por-cobrar' && 'border-sky-200 ring-2 ring-sky-100',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span>
                  <span className="block text-xs font-medium text-slate-400">Mesa</span>
                  <span className="block text-3xl leading-none font-bold tracking-tight text-slate-900">{table.id}</span>
                </span>
                <TableStatusBadge status={status} />
              </div>

              {isFree ? (
                <div className="mt-auto flex items-center justify-between text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-4" />
                    {table.seats} personas
                  </span>
                  <span className="grid size-8 place-items-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                    <Plus className="size-4" />
                  </span>
                </div>
              ) : (
                <div className="mt-auto">
                  <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{formatColones(total)}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs whitespace-nowrap text-slate-500">
                    {linesCount(table.lines)} productos
                    {table.openedAt && (
                      <>
                        <span aria-hidden>·</span>
                        <Clock className="size-3" />
                        {formatElapsed(now - table.openedAt)}
                      </>
                    )}
                  </p>
                  {(inKitchen > 0 || unsent > 0) && (
                    <p
                      className={cn(
                        'mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium',
                        unsent > 0 ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      <ChefHat className="size-3.5" />
                      {unsent > 0 ? `${unsent} sin enviar` : 'En cocina'}
                    </p>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}
