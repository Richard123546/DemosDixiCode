import { CalendarRange, ChevronRight, FileSpreadsheet, HandCoins, ReceiptText, TrendingUp, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ColonesBarChart, type BarDatum } from '../../components/charts/ColonesBarChart'
import { useReceipt } from '../../components/share/receiptContext'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Sheet } from '../../components/ui/Sheet'
import { HeroStat, StatCard, StatGrid } from '../../components/ui/Stat'
import { useToast } from '../../components/ui/toastContext'
import { getService, getStaff, paymentMethods, type PaymentMethod } from '../../data/salon'
import { cn } from '../../lib/cn'
import { downloadCsv } from '../../lib/csv'
import { addDays, startOfMonth, startOfWeek } from '../../lib/date'
import { formatColones, formatMonthName, formatShortDate, formatTime, formatWeekdayShort } from '../../lib/format'
import { shortName } from '../../lib/text'
import { AppointmentSheet } from './AppointmentSheet'
import { paymentIcons } from '../../components/payment/paymentIcons'
import { PaymentMethodLabel } from '../../components/payment/PaymentMethodPicker'
import { useClientMap, useSalon } from './salonStore'
import { appointmentsOn, revenueBetween, revenueOn } from './selectors'
import { appointmentReceipt } from './share'
import { StatusBadge } from './status'

export default function CajaPage() {
  const { today, agendaStart, appointments } = useSalon()
  const clientMap = useClientMap()
  const toast = useToast()
  const showReceipt = useReceipt()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [chargeId, setChargeId] = useState<string | null>(null)

  const todayAppointments = useMemo(() => appointmentsOn(appointments, today), [appointments, today])
  const paidToday = todayAppointments
    .filter((a) => a.payment)
    .sort((a, b) => b.payment!.paidAt - a.payment!.paidAt)
  const unpaidToday = todayAppointments.filter((a) => !a.payment)
  const pendingAmount = unpaidToday.reduce((sum, a) => sum + getService(a.serviceId).price, 0)

  const totals = {
    today: revenueOn(appointments, today, agendaStart),
    week: revenueBetween(appointments, startOfWeek(today), today, agendaStart),
    month: revenueBetween(appointments, startOfMonth(today), today, agendaStart),
  }

  const byMethod = paidToday.reduce(
    (acc, a) => ({ ...acc, [a.payment!.method]: acc[a.payment!.method] + a.payment!.amount }),
    { sinpe: 0, efectivo: 0, tarjeta: 0 } as Record<PaymentMethod, number>,
  )

  // Todos los cobros registrados, del más reciente al más viejo.
  const exportPayments = () => {
    const paid = appointments
      .filter((a) => a.payment)
      .sort((a, b) => b.date.localeCompare(a.date) || b.payment!.paidAt - a.payment!.paidAt)
    downloadCsv(
      'cobros-studio-valeria',
      ['Fecha', 'Hora', 'Clienta', 'Teléfono', 'Servicio', 'Atendió', 'Método de pago', 'Monto (₡)'],
      paid.map((a) => {
        const client = clientMap.get(a.clientId)
        return [
          a.date,
          formatTime(a.payment!.paidAt),
          client?.name ?? 'Clienta',
          client?.phone ?? '',
          getService(a.serviceId).name,
          getStaff(a.staffId).name,
          paymentMethods[a.payment!.method],
          a.payment!.amount,
        ]
      }),
    )
    toast('Reporte descargado ✓', `${paid.length} cobros en un archivo para Excel.`)
  }

  return (
    <>
      <PageHeader
        title="Caja"
        description="Lo que ha entrado al negocio, al día de hoy."
        actions={
          <>
          <Button variant="secondary" onClick={exportPayments} className="max-md:flex-1">
            <FileSpreadsheet className="size-5" />
            Exportar a Excel
          </Button>
          <Button variant="accent" onClick={() => setPickerOpen(true)} className="max-md:flex-1">
            <Wallet className="size-5" />
            Cobrar cita
            {unpaidToday.length > 0 && (
              <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs tabular-nums">{unpaidToday.length}</span>
            )}
          </Button>
          </>
        }
      />

      <StatGrid>
        <HeroStat
          icon={HandCoins}
          label="Ganado hoy"
          value={formatColones(totals.today)}
          hint={
            <>
              {paidToday.length} {paidToday.length === 1 ? 'cobro' : 'cobros'}
              {pendingAmount > 0 && <> · {formatColones(pendingAmount)} por cobrar</>}
            </>
          }
        />
        <StatCard
          icon={CalendarRange}
          label="Esta semana"
          value={formatColones(totals.week)}
          hint={`Desde el lunes ${formatShortDate(startOfWeek(today))}`}
        />
        <StatCard
          icon={TrendingUp}
          label={`En ${formatMonthName(today)}`}
          value={formatColones(totals.month)}
          hint={`Del 1 al ${Number(today.slice(8))}`}
        />
      </StatGrid>

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-5 xl:grid-cols-5 xl:gap-5">
        <RevenueChart className="xl:col-span-3" />

        <Card className="flex min-w-0 flex-col xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Cobros de hoy</h2>
            <span className="text-sm text-slate-500 tabular-nums">{formatColones(totals.today)}</span>
          </div>
          {paidToday.length === 0 ? (
            <EmptyState
              icon={ReceiptText}
              title="Todavía no hay cobros hoy"
              description="Cuando cobrés una cita, aparece aquí con el método de pago."
              action={
                <Button variant="accent" onClick={() => setPickerOpen(true)}>
                  Cobrar cita
                </Button>
              }
            />
          ) : (
            <>
              <ul className="flex-1 divide-y divide-slate-100">
                {paidToday.map((a) => {
                  const name = clientMap.get(a.clientId)?.name ?? 'Clienta'
                  return (
                    <li key={a.id} className="animate-fade-in">
                      <button
                        type="button"
                        onClick={() => showReceipt(appointmentReceipt(a, name)!)}
                        title="Ver comprobante"
                        className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
                      >
                      <Avatar name={name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{shortName(name)}</p>
                        <p className="truncate text-xs text-slate-500">{getService(a.serviceId).name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 tabular-nums">
                          {formatColones(a.payment!.amount)}
                        </p>
                        <p className="flex items-center justify-end gap-1.5">
                          <PaymentMethodLabel method={a.payment!.method} />
                          <span className="text-xs text-slate-400">· {formatTime(a.payment!.paidAt)}</span>
                        </p>
                      </div>
                      <ReceiptText className="size-4 shrink-0 text-slate-300" />
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
                {(Object.keys(byMethod) as PaymentMethod[]).map((method) => {
                  const Icon = paymentIcons[method]
                  return (
                    <div key={method}>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <Icon className="size-3.5" />
                        {paymentMethods[method]}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-900 tabular-nums">
                        {formatColones(byMethod[method])}
                      </p>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </Card>
      </div>

      <Sheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="¿Qué cita vas a cobrar?"
        description="Citas de hoy que todavía no se han pagado."
      >
        {unpaidToday.length === 0 ? (
          <EmptyState
            icon={HandCoins}
            title="Todo cobrado"
            description="No quedan citas pendientes de pago hoy. ¡Buen trabajo!"
            className="py-8"
          />
        ) : (
          <ul className="-mx-2 space-y-1">
            {unpaidToday.map((a) => {
              const name = clientMap.get(a.clientId)?.name ?? 'Clienta'
              const service = getService(a.serviceId)
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setPickerOpen(false)
                      setChargeId(a.id)
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
                  >
                    <span className="w-16 shrink-0 text-sm font-medium text-slate-500 tabular-nums">
                      {formatTime(a.start)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">{shortName(name)}</span>
                      <span className="block truncate text-xs text-slate-500">{service.name}</span>
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold text-slate-900 tabular-nums">
                        {formatColones(service.price)}
                      </span>
                      <StatusBadge status={a.status} />
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-slate-300" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Sheet>

      <AppointmentSheet appointmentId={chargeId} onClose={() => setChargeId(null)} startWithPayment />
    </>
  )
}

function RevenueChart({ className }: { className?: string }) {
  const { today, agendaStart, appointments } = useSalon()
  const data: BarDatum[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6)
    return {
      key: date,
      label: date === today ? 'Hoy' : `${formatWeekdayShort(date)} ${Number(date.slice(8))}`,
      title: date === today ? 'Hoy (en curso)' : `${formatWeekdayShort(date)} ${formatShortDate(date)}`,
      value: revenueOn(appointments, date, agendaStart),
      current: date === today,
    }
  })
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card className={cn('min-w-0 p-5 md:p-6', className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-semibold text-slate-900">Últimos 7 días</h2>
          <p className="text-sm text-slate-500">Promedio de {formatColones(total / 7)} por día</p>
        </div>
        <p className="text-xl font-bold text-slate-900 tabular-nums">{formatColones(total)}</p>
      </div>
      <div className="mt-5">
        <ColonesBarChart data={data} label="Gráfico de ingresos de los últimos 7 días" />
      </div>
    </Card>
  )
}
