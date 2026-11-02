import { CalendarCheck2, CalendarClock, CalendarPlus, CheckCheck, Crown, HandCoins, MessageCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MiniAreaChart, type MiniDatum } from '../../components/dashboard/MiniAreaChart'
import { SectionShortcuts } from '../../components/dashboard/SectionShortcuts'
import { TrendBadge } from '../../components/dashboard/TrendBadge'
import { WhatsAppSheet } from '../../components/share/WhatsAppSheet'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { HeroStat, StatCard, StatGrid } from '../../components/ui/Stat'
import { getService, type Appointment } from '../../data/salon'
import { cn } from '../../lib/cn'
import { addDays, diffDays, nowMinutes, startOfMonth } from '../../lib/date'
import { formatColones, formatDayTitle, formatShortDate, formatTime, formatWeekdayShort, greeting } from '../../lib/format'
import { shortName } from '../../lib/text'
import { AppointmentSheet } from './AppointmentSheet'
import { NewAppointmentSheet } from './NewAppointmentSheet'
import { useClientMap, useSalon } from './salonStore'
import { revenueOn, revenueUntil } from './selectors'
import { reminderDraft } from './share'
import { StatusBadge } from './status'

export default function InicioPage() {
  const { today, agendaStart, appointments, remindedIds, markReminded } = useSalon()
  const clientMap = useClientMap()
  const [openId, setOpenId] = useState<string | null>(null)
  const [remindId, setRemindId] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)

  const now = nowMinutes()
  const yesterday = addDays(today, -1)
  const salesToday = revenueOn(appointments, today, agendaStart)
  const salesYesterday = revenueUntil(appointments, yesterday, now, agendaStart)

  const todayList = appointments.filter((a) => a.date === today)
  const toAttend = todayList.filter((a) => a.status !== 'completada').sort((a, b) => a.start - b.start)
  const unconfirmed = toAttend.filter((a) => a.status === 'pendiente').length

  // Si ya no quedan citas hoy, se muestran las de los próximos días.
  const upcoming = (
    toAttend.length
      ? toAttend
      : appointments
          .filter((a) => diffDays(today, a.date) > 0 && a.status !== 'completada')
          .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start)
  ).slice(0, 5)
  const next = toAttend.find((a) => a.start >= now) ?? toAttend[0]

  const topService = useMemo(() => {
    const monthStart = startOfMonth(today)
    const counts = new Map<string, number>()
    for (const a of appointments) {
      if (a.status === 'completada' && diffDays(monthStart, a.date) >= 0) counts.set(a.serviceId, (counts.get(a.serviceId) ?? 0) + 1)
    }
    const [id, count] = [...counts].sort((a, b) => b[1] - a[1])[0] ?? []
    return id ? { service: getService(id), count: count! } : null
  }, [appointments, today])

  const chart: MiniDatum[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6)
    return {
      key: date,
      label: date === today ? 'Hoy' : formatWeekdayShort(date),
      title: date === today ? 'Hoy' : `${formatWeekdayShort(date)} ${formatShortDate(date)}`,
      value: revenueOn(appointments, date, agendaStart),
    }
  })
  const weekTotal = chart.reduce((sum, d) => sum + d.value, 0)
  const remindAppointment = appointments.find((a) => a.id === remindId)

  return (
    <>
      <PageHeader
        title={`${greeting()} 👋`}
        description="Así va Studio Valeria hoy."
        actions={
          <Button variant="accent" onClick={() => setBooking(true)} className="max-md:w-full">
            <CalendarPlus className="size-5" />
            Nueva cita
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
          icon={CalendarClock}
          label="Citas por atender"
          value={String(toAttend.length)}
          hint={unconfirmed ? `${unconfirmed} sin confirmar` : 'Todas confirmadas'}
        />
        <StatCard
          icon={Crown}
          label="Servicio estrella"
          value={topService?.service.name ?? '—'}
          valueClassName="text-base leading-snug md:text-lg line-clamp-2"
          hint={topService ? `${topService.count} veces este mes` : 'Sin datos del mes'}
        />
        <StatCard
          icon={CalendarCheck2}
          label="Próxima cita"
          value={next ? formatTime(next.start) : 'Libre'}
          hint={next ? shortName(clientMap.get(next.clientId)?.name ?? 'Clienta') : 'No quedan citas hoy'}
        />
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
          <MiniAreaChart data={chart} label="Ingresos de los últimos 7 días" className="mt-4" />
        </Card>

        <Card className="flex min-w-0 flex-col overflow-hidden xl:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">{toAttend.length ? 'Próximas citas de hoy' : 'Próximas citas'}</h2>
              <p className="text-sm text-slate-500">Recordales por WhatsApp con un toque.</p>
            </div>
            <Link to="/salon/agenda" className="text-sm font-semibold whitespace-nowrap text-accent-ink hover:underline">
              Ver agenda
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState icon={CalendarCheck2} title="Agenda despejada" description="No hay citas por atender. Buen momento para agendar." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((a) => (
                <UpcomingRow
                  key={a.id}
                  appointment={a}
                  name={clientMap.get(a.clientId)?.name ?? 'Clienta'}
                  showDay={a.date !== today}
                  reminded={remindedIds.includes(a.id)}
                  onOpen={() => setOpenId(a.id)}
                  onRemind={() => setRemindId(a.id)}
                />
              ))}
            </ul>
          )}
        </Card>
      </div>

      <SectionShortcuts />

      <AppointmentSheet appointmentId={openId} onClose={() => setOpenId(null)} />
      <NewAppointmentSheet open={booking} onClose={() => setBooking(false)} />
      <WhatsAppSheet
        draft={remindAppointment ? reminderDraft(remindAppointment, clientMap.get(remindAppointment.clientId), today) : null}
        onClose={() => setRemindId(null)}
        onSent={() => remindId && markReminded(remindId)}
      />
    </>
  )
}

function UpcomingRow({
  appointment,
  name,
  showDay,
  reminded,
  onOpen,
  onRemind,
}: {
  appointment: Appointment
  name: string
  showDay: boolean
  reminded: boolean
  onOpen: () => void
  onRemind: () => void
}) {
  const { today } = useSalon()
  return (
    <li className="flex animate-fade-in items-center gap-3 px-5 py-3">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="w-[4.5rem] shrink-0 text-sm font-semibold text-slate-900 tabular-nums">
          {formatTime(appointment.start)}
          {showDay && (
            <span className="block text-xs font-normal text-slate-500">{formatDayTitle(appointment.date, today).split(',')[0]}</span>
          )}
        </span>
        <Avatar name={name} size="sm" className="max-[379px]:hidden" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-900">{shortName(name)}</span>
          <span className="block truncate text-xs text-slate-500">{getService(appointment.serviceId).name}</span>
        </span>
        <StatusBadge status={appointment.status} className="max-md:hidden" />
      </button>
      <button
        type="button"
        onClick={onRemind}
        aria-label={`Enviar recordatorio a ${name}`}
        className={cn(
          'flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-all active:scale-95',
          reminded
            ? 'bg-emerald-50 text-emerald-700'
            : 'border border-slate-200 bg-surface text-slate-700 hover:border-emerald-300 hover:text-emerald-700',
        )}
      >
        {reminded ? <CheckCheck className="size-4" /> : <MessageCircle className="size-4" />}
        <span className="max-sm:sr-only">{reminded ? 'Enviado' : 'Recordar'}</span>
      </button>
    </li>
  )
}
