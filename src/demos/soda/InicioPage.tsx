import { ChefHat, ClipboardList, HandCoins, LayoutGrid, Plus, Receipt, Timer, Trophy } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { MiniAreaChart, type MiniDatum } from '../../components/dashboard/MiniAreaChart'
import { SectionShortcuts } from '../../components/dashboard/SectionShortcuts'
import { TrendBadge } from '../../components/dashboard/TrendBadge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { HeroStat, StatCard, StatGrid } from '../../components/ui/Stat'
import { getMenuItem } from '../../data/soda'
import { cn } from '../../lib/cn'
import { formatColones, formatElapsed, formatHour, greeting } from '../../lib/format'
import { useNow } from '../../lib/useNow'
import { linesTotal, pendingTickets, tableStatus, topDishes } from './selectors'
import { useSoda } from './sodaStore'

const MIN = 60_000
const HOUR = 60 * MIN

export default function InicioPage() {
  const { sales, yesterdaySales, tables, tickets } = useSoda()
  const navigate = useNavigate()
  const now = useNow()

  const sum = (list: typeof sales) => list.reduce((total, s) => total + s.total, 0)
  const salesToday = sum(sales)
  const kitchen = pendingTickets(tickets).sort((a, b) => a.createdAt - b.createdAt)
  const rows = tables.map((table) => ({ table, status: tableStatus(table, tickets) }))
  const occupied = rows.filter((r) => r.status !== 'libre')
  const toCharge = rows.filter((r) => r.status === 'por-cobrar')
  const openAmount = occupied.reduce((total, r) => total + linesTotal(r.table.lines), 0)
  const top = topDishes(sales, 1)[0]

  // Ventas por hora en las últimas 7 horas.
  const currentHour = new Date(now).getHours()
  const chart: MiniDatum[] = Array.from({ length: 7 }, (_, i) => {
    const hour = currentHour - 6 + i
    const start = new Date(now).setHours(hour, 0, 0, 0)
    return {
      key: String(hour),
      label: i === 6 ? 'Ahora' : `${((hour + 24) % 12) || 12}:00`,
      title: i === 6 ? 'Esta hora' : `De ${formatHour((hour + 24) % 24)} a ${formatHour((hour + 25) % 24)}`,
      value: sum(sales.filter((s) => s.paidAt >= start && s.paidAt < start + HOUR)),
    }
  })
  const best = chart.reduce((a, b) => (b.value > a.value ? b : a))

  return (
    <>
      <PageHeader
        title={`${greeting()} 👋`}
        description="Así va Soda La Esquina hoy."
        actions={
          <Button variant="accent" onClick={() => navigate('/soda/mesas')} className="max-md:w-full">
            <Plus className="size-5" />
            Tomar pedido
          </Button>
        }
      />

      <StatGrid>
        <HeroStat
          icon={HandCoins}
          label="Ventas de hoy"
          value={formatColones(salesToday)}
          hint={<TrendBadge current={salesToday} previous={sum(yesterdaySales)} label="vs. ayer a esta hora" onAccent />}
        />
        <StatCard
          icon={ChefHat}
          label="Pedidos en cocina"
          value={String(kitchen.length)}
          hint={toCharge.length ? `${toCharge.length} ${toCharge.length === 1 ? 'mesa' : 'mesas'} por cobrar` : 'Ninguna mesa por cobrar'}
        />
        <StatCard
          icon={Trophy}
          label="Plato más vendido"
          value={top ? getMenuItem(top.itemId).name : '—'}
          valueClassName="text-base leading-snug md:text-lg line-clamp-2"
          hint={top ? `${top.qty} vendidos hoy` : 'Todavía sin ventas'}
        />
        <StatCard
          icon={LayoutGrid}
          label="Mesas ocupadas"
          value={`${occupied.length} de ${tables.length}`}
          hint={`${formatColones(openAmount)} en consumo`}
        />
      </StatGrid>

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-5 xl:grid-cols-5 xl:gap-5">
        <Card className="flex min-w-0 flex-col p-5 md:p-6 xl:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Ventas por hora</h2>
              <p className="text-sm text-slate-500">
                {best.value ? `La hora más fuerte: ${best.title.toLowerCase()}` : 'Sin ventas en las últimas horas'}
              </p>
            </div>
          </div>
          <MiniAreaChart data={chart} label="Ventas por hora de las últimas 7 horas" className="mt-4" />
        </Card>

        <Card className="flex min-w-0 flex-col overflow-hidden xl:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Pedidos pendientes</h2>
              <p className="text-sm text-slate-500">Comandas en cocina, de la más vieja a la más nueva.</p>
            </div>
            <Link to="/soda/cocina" className="text-sm font-semibold whitespace-nowrap text-accent-ink hover:underline">
              Ver cocina
            </Link>
          </div>
          {kitchen.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Cocina al día" description="No hay comandas esperando. Las nuevas aparecen aquí." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {kitchen.slice(0, 5).map((ticket) => {
                const elapsed = now - ticket.createdAt
                return (
                  <li key={ticket.id}>
                    <Link
                      to="/soda/cocina"
                      className="flex animate-fade-in items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-sm font-bold text-accent-ink">
                        {ticket.tableId}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-slate-900">
                          Mesa {ticket.tableId} <span className="text-slate-400">· #{ticket.number}</span>
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {ticket.lines.map((l) => `${l.qty} ${getMenuItem(l.itemId).name}`).join(', ')}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                          elapsed >= 15 * MIN
                            ? 'bg-red-50 text-red-700'
                            : elapsed >= 10 * MIN
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700',
                        )}
                      >
                        <Timer className="size-3.5" />
                        {formatElapsed(elapsed)}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
          {toCharge.length > 0 && (
            <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
              <span className="text-xs font-semibold text-slate-500">Por cobrar:</span>
              {toCharge.map(({ table }) => (
                <Link
                  key={table.id}
                  to={`/soda/pedido?mesa=${table.id}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 text-xs font-semibold text-sky-800 transition-all hover:-translate-y-px hover:shadow-card"
                >
                  <Receipt className="size-3.5" />
                  Mesa {table.id} · {formatColones(linesTotal(table.lines))}
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <SectionShortcuts />
    </>
  )
}
