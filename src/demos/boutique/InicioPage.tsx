import { BellRing, ChevronRight, Crown, HandCoins, Receipt, ShoppingBag } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { MiniAreaChart, type MiniDatum } from '../../components/dashboard/MiniAreaChart'
import { SectionShortcuts } from '../../components/dashboard/SectionShortcuts'
import { TrendBadge } from '../../components/dashboard/TrendBadge'
import { PaymentMethodLabel } from '../../components/payment/PaymentMethodPicker'
import { useReceipt } from '../../components/share/receiptContext'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { HeroStat, StatCard, StatGrid } from '../../components/ui/Stat'
import { getProductInfo, type Sale } from '../../data/boutique'
import { addDays, diffDays, nowMinutes, startOfMonth } from '../../lib/date'
import { formatColones, formatRelativeDay, formatShortDate, formatTime, formatWeekdayShort, greeting } from '../../lib/format'
import { useBoutique } from './boutiqueStore'
import { ProductArt } from './ProductArt'
import { rankSales, stockStatus } from './selectors'
import { saleReceipt } from './share'
import { StockBadge } from './StockBadge'

export default function InicioPage() {
  const { sales, products, today, requested } = useBoutique()
  const navigate = useNavigate()
  const showReceipt = useReceipt()

  const sum = (list: Sale[]) => list.reduce((total, s) => total + s.total, 0)
  const now = nowMinutes()
  const salesToday = sum(sales.filter((s) => s.date === today))
  const salesYesterday = sum(sales.filter((s) => s.date === addDays(today, -1) && s.minute <= now))

  const monthSales = sales.filter((s) => diffDays(startOfMonth(today), s.date) >= 0)
  const top = rankSales(monthSales, (l) => l.productId)[0]
  const topProduct = top && getProductInfo(top.key)
  const alerts = products.filter((p) => stockStatus(p) !== 'ok')
  const toRestock = alerts.filter((p) => !requested.includes(p.id))
  const outOfStock = alerts.filter((p) => stockStatus(p) === 'agotado').length
  const average = monthSales.length ? sum(monthSales) / monthSales.length : 0

  const chart: MiniDatum[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6)
    return {
      key: date,
      label: date === today ? 'Hoy' : formatWeekdayShort(date),
      title: date === today ? 'Hoy' : `${formatWeekdayShort(date)} ${formatShortDate(date)}`,
      value: sum(sales.filter((s) => s.date === date)),
    }
  })
  const weekTotal = chart.reduce((total, d) => total + d.value, 0)
  const latest = [...sales].sort((a, b) => b.date.localeCompare(a.date) || b.minute - a.minute).slice(0, 5)

  return (
    <>
      <PageHeader
        title={`${greeting()} 👋`}
        description="Así va Boutique Amara hoy."
        actions={
          <Button variant="accent" onClick={() => navigate('/boutique/vender')} className="max-md:w-full">
            <ShoppingBag className="size-5" />
            Nueva venta
          </Button>
        }
      />

      <StatGrid>
        <HeroStat
          icon={HandCoins}
          label="Ventas de hoy"
          value={formatColones(salesToday)}
          hint={<TrendBadge current={salesToday} previous={salesYesterday} label="vs. ayer a esta hora" onAccent />}
        />
        <StatCard
          icon={BellRing}
          label="Por reabastecer"
          value={String(toRestock.length)}
          hint={toRestock.length ? `${outOfStock} agotados · pedí desde Alertas` : 'Todo pedido o bien surtido'}
        />
        <StatCard
          icon={Crown}
          label="Más vendido del mes"
          value={topProduct?.name ?? '—'}
          valueClassName="text-base leading-snug md:text-lg line-clamp-2"
          hint={top ? `${top.units} unidades · ${formatColones(top.revenue)}` : 'Sin ventas este mes'}
        />
        <StatCard icon={Receipt} label="Ticket promedio" value={formatColones(average)} hint="Por venta, este mes" />
      </StatGrid>

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-5 xl:grid-cols-5 xl:gap-5">
        <Card className="flex min-w-0 flex-col p-5 md:p-6 xl:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Últimos 7 días</h2>
              <p className="text-sm text-slate-500">Promedio de {formatColones(weekTotal / 7)} por día</p>
            </div>
            <p className="text-lg font-bold text-slate-900 tabular-nums">{formatColones(weekTotal)}</p>
          </div>
          <MiniAreaChart data={chart} label="Ventas de los últimos 7 días" className="mt-4" />
        </Card>

        <Card className="flex min-w-0 flex-col overflow-hidden xl:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Últimas ventas</h2>
              <p className="text-sm text-slate-500">Tocá una para ver o compartir el comprobante.</p>
            </div>
            <Link to="/boutique/reportes" className="text-sm font-semibold whitespace-nowrap text-accent-ink hover:underline">
              Ver reportes
            </Link>
          </div>
          {latest.length === 0 ? (
            <EmptyState icon={Receipt} title="Todavía no hay ventas" description="Cuando vendás algo, aparece aquí con su comprobante." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {latest.map((sale) => {
                const first = getProductInfo(sale.lines[0].productId)
                const units = sale.lines.reduce((n, l) => n + l.qty, 0)
                return (
                  <li key={sale.id}>
                    <button
                      type="button"
                      onClick={() => showReceipt(saleReceipt(sale))}
                      className="flex w-full animate-fade-in items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
                    >
                      <ProductArt kind={first.kind} hex={first.colors[0].hex} className="size-11 shrink-0 rounded-lg" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-900">
                          {first.name}
                          {sale.lines.length > 1 && <span className="text-slate-400"> +{sale.lines.length - 1}</span>}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {formatRelativeDay(sale.date, today)} · {formatTime(sale.minute)} · {units} {units === 1 ? 'artículo' : 'artículos'}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block text-sm font-semibold text-slate-900 tabular-nums">{formatColones(sale.total)}</span>
                        <PaymentMethodLabel method={sale.method} />
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-slate-300" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          {toRestock.length > 0 && (
            <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
              <span className="text-xs font-semibold text-slate-500">Reabastecer:</span>
              {toRestock.slice(0, 3).map((product) => (
                <Link
                  key={product.id}
                  to="/boutique/alertas"
                  className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-surface pr-3 pl-1.5 text-xs font-medium text-slate-700 transition-all hover:-translate-y-px hover:shadow-card"
                >
                  <StockBadge status={stockStatus(product)} className="px-1.5 [&>svg]:hidden" />
                  <span className="truncate">{product.name}</span>
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
