import { CalendarRange, FileSpreadsheet, HandCoins, Receipt, Shirt, Trophy } from 'lucide-react'
import { ColonesBarChart, type BarDatum } from '../../components/charts/ColonesBarChart'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { HeroStat, StatCard, StatGrid } from '../../components/ui/Stat'
import { useToast } from '../../components/ui/toastContext'
import { categories, getProductInfo } from '../../data/boutique'
import { paymentMethods } from '../../data/payments'
import { cn } from '../../lib/cn'
import { downloadCsv } from '../../lib/csv'
import { addDays, diffDays, startOfMonth, startOfWeek } from '../../lib/date'
import { formatColones, formatMonthName, formatShortDate, formatTime } from '../../lib/format'
import { useBoutique } from './boutiqueStore'
import { ProductArt } from './ProductArt'
import { rankSales } from './selectors'

export default function ReportesPage() {
  const { sales, today } = useBoutique()
  const toast = useToast()
  const monthStart = startOfMonth(today)
  const todaySales = sales.filter((s) => s.date === today)
  const monthSales = sales.filter((s) => diffDays(monthStart, s.date) >= 0)
  const sum = (list: typeof sales) => list.reduce((total, s) => total + s.total, 0)
  const monthTotal = sum(monthSales)
  const monthUnits = monthSales.reduce((n, s) => n + s.lines.reduce((m, l) => m + l.qty, 0), 0)

  const top = rankSales(monthSales, (l) => l.productId).slice(0, 5)
  const byCategory = rankSales(monthSales, (l) => getProductInfo(l.productId).category)
  const categoryRows = categories
    .map((category) => byCategory.find((r) => r.key === category) ?? { key: category, units: 0, revenue: 0 })
    .sort((a, b) => b.revenue - a.revenue)

  // Una fila por artículo vendido en el mes, para sumar por producto, talla o color en Excel.
  const exportMonth = () => {
    const sorted = [...monthSales].sort((a, b) => b.date.localeCompare(a.date) || b.minute - a.minute)
    downloadCsv(
      `ventas-boutique-amara-${formatMonthName(today)}`,
      ['Fecha', 'Hora', 'Producto', 'Categoría', 'Color', 'Talla', 'Cantidad', 'Precio (₡)', 'Subtotal (₡)', 'Método de pago'],
      sorted.flatMap((sale) =>
        sale.lines.map((l) => {
          const product = getProductInfo(l.productId)
          return [
            sale.date,
            formatTime(sale.minute),
            product.name,
            product.category,
            l.color,
            l.size,
            l.qty,
            l.price,
            l.qty * l.price,
            paymentMethods[sale.method],
          ]
        }),
      ),
    )
    toast('Reporte descargado ✓', `${monthSales.length} ventas de ${formatMonthName(today)} en un archivo para Excel.`)
  }

  return (
    <>
      <PageHeader
        title="Reportes"
        description={`Resumen de ventas de ${formatMonthName(today)}`}
        actions={
          <Button variant="secondary" onClick={exportMonth} className="max-md:w-full">
            <FileSpreadsheet className="size-5" />
            Exportar a Excel
          </Button>
        }
      />

      <StatGrid>
        <HeroStat
          icon={HandCoins}
          label="Ventas de hoy"
          value={formatColones(sum(todaySales))}
          hint={`${todaySales.length} ${todaySales.length === 1 ? 'venta' : 'ventas'}`}
        />
        <StatCard icon={CalendarRange} label="Ventas del mes" value={formatColones(monthTotal)} hint={`${monthSales.length} ventas desde el 1`} />
        <StatCard
          icon={Receipt}
          label="Ticket promedio"
          value={formatColones(monthSales.length ? monthTotal / monthSales.length : 0)}
          hint="Por venta, este mes"
        />
        <StatCard icon={Shirt} label="Unidades" value={String(monthUnits)} hint="Vendidas este mes" />
      </StatGrid>

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-5 xl:grid-cols-5 xl:gap-5">
        <WeeklyChart className="xl:col-span-3" />

        <Card className="min-w-0 p-5 md:p-6 xl:col-span-2">
          <h2 className="font-semibold text-slate-900">Ventas por categoría</h2>
          <p className="text-sm text-slate-500">Este mes, en colones.</p>
          <ul className="mt-5 space-y-4">
            {categoryRows.map((row) => {
              const share = monthTotal ? row.revenue / monthTotal : 0
              return (
                <li key={row.key}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium text-slate-900">{row.key}</span>
                    <span className="text-slate-500 tabular-nums">
                      <span className="font-semibold text-slate-900">{formatColones(row.revenue)}</span> · {Math.round(share * 100)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${share * 100}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{row.units} unidades</p>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      <Card className="mt-4 p-5 md:mt-5 md:p-6">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <Trophy className="size-4 text-accent" />
          Top 5 del mes
        </h2>
        <p className="text-sm text-slate-500">Productos con más unidades vendidas.</p>
        <ol className="mt-5 grid gap-3 md:grid-cols-5 md:gap-4">
          {top.map((row, i) => {
            const product = getProductInfo(row.key)
            return (
              <li key={row.key} className="flex items-center gap-3 md:flex-col md:items-stretch">
                <div className="relative shrink-0">
                  <ProductArt kind={product.kind} hex={product.colors[0].hex} className="size-16 rounded-xl md:aspect-square md:size-auto md:w-full" />
                  <span className="absolute -top-2 -left-2 grid size-7 place-items-center rounded-full bg-slate-900 text-xs font-bold text-slate-50 ring-2 ring-surface">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-slate-900">{product.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                    <span className="font-semibold text-slate-900">{row.units} unidades</span> · {formatColones(row.revenue)}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </Card>
    </>
  )
}

function WeeklyChart({ className }: { className?: string }) {
  const { sales, today } = useBoutique()
  const thisWeek = startOfWeek(today)
  const data: BarDatum[] = Array.from({ length: 8 }, (_, i) => {
    const start = addDays(thisWeek, (i - 7) * 7)
    const end = addDays(start, 6)
    return {
      key: start,
      label: i === 7 ? 'Esta sem.' : formatShortDate(start),
      title: i === 7 ? 'Esta semana (en curso)' : `Semana del ${formatShortDate(start)}`,
      value: sales.filter((s) => diffDays(start, s.date) >= 0 && diffDays(s.date, end) >= 0).reduce((t, s) => t + s.total, 0),
      current: i === 7,
    }
  })
  const best = data.reduce((a, b) => (b.value > a.value ? b : a))

  return (
    <Card className={cn('min-w-0 p-5 md:p-6', className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-semibold text-slate-900">Ventas por semana</h2>
          <p className="text-sm text-slate-500">Últimas 8 semanas · la mejor fue la del {formatShortDate(best.key)}</p>
        </div>
      </div>
      <div className="mt-5">
        <ColonesBarChart data={data} label="Gráfico de ventas por semana de las últimas 8 semanas" />
      </div>
    </Card>
  )
}
