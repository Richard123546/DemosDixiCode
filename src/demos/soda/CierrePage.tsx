import { ClipboardList, FileSpreadsheet, HandCoins, MessageCircle, Receipt, ReceiptText, Trophy, Utensils } from 'lucide-react'
import { useState } from 'react'
import { PaymentMethodLabel } from '../../components/payment/PaymentMethodPicker'
import { paymentIcons } from '../../components/payment/paymentIcons'
import { useReceipt } from '../../components/share/receiptContext'
import { WhatsAppSheet } from '../../components/share/WhatsAppSheet'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { HeroStat, StatCard, StatGrid } from '../../components/ui/Stat'
import { useToast } from '../../components/ui/toastContext'
import { paymentMethods, type PaymentMethod } from '../../data/payments'
import { getMenuItem, type Sale } from '../../data/soda'
import { downloadCsv } from '../../lib/csv'
import { formatClock, formatColones, formatLongDate } from '../../lib/format'
import { linesCount, linesTotal, tableStatus, topDishes } from './selectors'
import { closingDraft, saleReceipt } from './share'
import { useSoda } from './sodaStore'

const today = formatLongDate(new Date())

export default function CierrePage() {
  const { sales, tables, tickets } = useSoda()
  const toast = useToast()
  const showReceipt = useReceipt()
  const [showAll, setShowAll] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)

  const total = sales.reduce((sum, s) => sum + s.total, 0)
  const average = sales.length ? total / sales.length : 0
  const openTables = tables.filter((t) => tableStatus(t, tickets) !== 'libre')
  const openAmount = openTables.reduce((sum, t) => sum + linesTotal(t.lines), 0)

  const methods = (Object.keys(paymentMethods) as PaymentMethod[]).map((method) => {
    const own = sales.filter((s) => s.method === method)
    return { method, count: own.length, amount: own.reduce((sum, s) => sum + s.total, 0) }
  })
  const top = topDishes(sales)
  const latest = [...sales].sort((a, b) => b.paidAt - a.paidAt)
  const visible = showAll ? latest : latest.slice(0, 8)

  const exportSales = () => {
    downloadCsv(
      'ventas-soda-la-esquina',
      ['Hora', 'Mesa', 'Productos', 'Cantidad', 'Método de pago', 'Total (₡)'],
      latest.map((s) => [
        formatClock(s.paidAt),
        s.tableId,
        s.lines.map((l) => `${l.qty} ${getMenuItem(l.itemId).name}`).join(', '),
        linesCount(s.lines),
        paymentMethods[s.method],
        s.total,
      ]),
    )
    toast('Reporte descargado ✓', `${sales.length} ventas en un archivo para Excel.`)
  }

  return (
    <>
      <PageHeader
        title="Cierre del día"
        description={today.charAt(0).toUpperCase() + today.slice(1)}
        actions={
          <>
            <Button variant="secondary" onClick={exportSales} className="max-md:flex-1">
              <FileSpreadsheet className="size-5" />
              Exportar a Excel
            </Button>
            <Button variant="accent" onClick={() => setSummaryOpen(true)} className="max-md:flex-1">
              <MessageCircle className="size-5" />
              <span className="md:hidden">Enviar</span>
              <span className="max-md:hidden">Enviar resumen</span>
            </Button>
          </>
        }
      />

      <StatGrid>
        <HeroStat icon={HandCoins} label="Ventas del día" value={formatColones(total)} hint="Cobrado e ingresado a caja" />
        <StatCard icon={Receipt} label="Pedidos cobrados" value={String(sales.length)} hint="Cuentas cerradas hoy" />
        <StatCard icon={Utensils} label="Ticket promedio" value={formatColones(average)} hint="Por cuenta" />
        <StatCard
          icon={ClipboardList}
          label="Mesas abiertas"
          value={formatColones(openAmount)}
          hint={`${openTables.length} ${openTables.length === 1 ? 'mesa' : 'mesas'} por cobrar todavía`}
        />
      </StatGrid>

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-5 md:grid-cols-2 xl:gap-5">
        <Card className="min-w-0 p-5 md:p-6">
          <h2 className="font-semibold text-slate-900">Por método de pago</h2>
          <p className="text-sm text-slate-500">Lo que debería haber en caja, en datáfono y en SINPE.</p>
          <ul className="mt-5 space-y-5">
            {methods.map(({ method, count, amount }) => {
              const Icon = paymentIcons[method]
              const share = total ? amount / total : 0
              return (
                <li key={method}>
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-900">{paymentMethods[method]}</span>
                      <span className="block text-xs text-slate-500">
                        {count} {count === 1 ? 'pago' : 'pagos'} · {Math.round(share * 100)}%
                      </span>
                    </span>
                    <span className="font-semibold text-slate-900 tabular-nums">{formatColones(amount)}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-accent transition-[width] duration-500"
                      style={{ width: `${share * 100}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card className="min-w-0 p-5 md:p-6">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <Trophy className="size-4 text-accent" />
            Los 5 platos más vendidos
          </h2>
          <p className="text-sm text-slate-500">Por cantidad vendida hoy, sin contar bebidas.</p>
          {top.length === 0 ? (
            <EmptyState icon={Trophy} title="Sin ventas todavía" className="py-8" />
          ) : (
            <ol className="mt-5 space-y-4">
              {top.map((row, i) => (
                <li key={row.itemId} className="flex items-center gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent-ink">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium text-slate-900">{getMenuItem(row.itemId).name}</span>
                      <span className="text-sm font-semibold whitespace-nowrap text-slate-900 tabular-nums">
                        {row.qty} <span className="font-normal text-slate-500">· {formatColones(row.revenue)}</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-accent/70 transition-[width] duration-500"
                        style={{ width: `${(row.qty / top[0].qty) * 100}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden md:mt-5">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Ventas del día</h2>
          <span className="text-sm text-slate-500">{sales.length} cuentas</span>
        </div>

        {/* Móvil y tablet */}
        <ul className="divide-y divide-slate-100 xl:hidden">
          {visible.map((sale) => (
            <li
              key={sale.id}
              role="button"
              tabIndex={0}
              onClick={() => showReceipt(saleReceipt(sale))}
              onKeyDown={(e) => e.key === 'Enter' && showReceipt(saleReceipt(sale))}
              className="flex animate-fade-in cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50 active:bg-slate-100"
            >
              <span className="w-[4.5rem] shrink-0 text-sm text-slate-500 tabular-nums">{formatClock(sale.paidAt)}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-slate-900">Mesa {sale.tableId}</span>
                <span className="block truncate text-xs text-slate-500">{describe(sale)}</span>
              </span>
              <span className="text-right">
                <span className="block text-sm font-semibold text-slate-900 tabular-nums">{formatColones(sale.total)}</span>
                <PaymentMethodLabel method={sale.method} />
              </span>
            </li>
          ))}
        </ul>

        {/* PC */}
        <table className="hidden w-full text-sm xl:table">
          <thead className="bg-slate-50/80 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-5 py-3">Hora</th>
              <th className="px-3 py-3">Mesa</th>
              <th className="px-3 py-3">Productos</th>
              <th className="px-3 py-3">Método</th>
              <th className="px-3 py-3 text-right">Total</th>
              <th className="px-5 py-3">
                <span className="sr-only">Comprobante</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((sale) => (
              <tr key={sale.id} className="group animate-fade-in hover:bg-slate-50">
                <td className="px-5 py-3 whitespace-nowrap text-slate-500 tabular-nums">{formatClock(sale.paidAt)}</td>
                <td className="px-3 py-3 font-medium whitespace-nowrap text-slate-900">Mesa {sale.tableId}</td>
                <td className="max-w-md truncate px-3 py-3 text-slate-600">{describe(sale)}</td>
                <td className="px-3 py-3">
                  <PaymentMethodLabel method={sale.method} />
                </td>
                <td className="px-3 py-3 text-right font-semibold whitespace-nowrap text-slate-900 tabular-nums">
                  {formatColones(sale.total)}
                </td>
                <td className="px-5 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => showReceipt(saleReceipt(sale))}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-500 transition-colors group-hover:text-accent-ink hover:bg-accent-soft"
                  >
                    <ReceiptText className="size-4" />
                    Comprobante
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {latest.length > 8 && (
          <div className="border-t border-slate-100 p-3 text-center">
            <Button variant="ghost" onClick={() => setShowAll((v) => !v)}>
              {showAll ? 'Ver menos' : `Ver las ${latest.length} ventas`}
            </Button>
          </div>
        )}
      </Card>

      <WhatsAppSheet draft={summaryOpen ? closingDraft(sales, openAmount) : null} onClose={() => setSummaryOpen(false)} />
    </>
  )
}

function describe(sale: Sale): string {
  return `${linesCount(sale.lines)} productos: ${sale.lines.map((l) => `${l.qty} ${getMenuItem(l.itemId).name}`).join(', ')}`
}
