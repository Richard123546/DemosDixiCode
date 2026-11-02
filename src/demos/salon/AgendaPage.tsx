import { CalendarPlus, CalendarX, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { InfoChips } from '../../components/ui/Chips'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { CLOSE_MINUTE, OPEN_MINUTE, type Appointment } from '../../data/salon'
import { cn } from '../../lib/cn'
import { addDays, diffDays, startOfWeek, weekDays, type DateKey } from '../../lib/date'
import { formatColones, formatDayTitle, formatShortDate, formatWeekdayShort } from '../../lib/format'
import { AppointmentSheet } from './AppointmentSheet'
import { NewAppointmentSheet, type NewAppointmentDefaults } from './NewAppointmentSheet'
import { useClientMap, useSalon } from './salonStore'
import { appointmentsOn, priceOf } from './selectors'
import { AppointmentBlock, HourLabels, HourLines, NowLine } from './timeline'
import { layoutLanes, minuteFromClick, useNowMinutes } from './timelineUtils'

const DAY_PX = 1.8
const WEEK_PX = 1.3

export default function AgendaPage() {
  const { today, agendaStart, agendaEnd, appointments, lastAddedId } = useSalon()
  const [params] = useSearchParams()
  // ?dia=2026-11-04 abre ese día (lo usa el buscador).
  const [selectedDate, setSelectedDate] = useState<DateKey>(() => {
    const day = params.get('dia')
    return day && diffDays(agendaStart, day) >= 0 && diffDays(day, agendaEnd) >= 0 ? day : today
  })
  const [openId, setOpenId] = useState<string | null>(null)
  const [newDefaults, setNewDefaults] = useState<NewAppointmentDefaults | null>(null)

  const weekStart = startOfWeek(selectedDate)
  const canGoBack = diffDays(agendaStart, addDays(weekStart, -7)) >= 0
  const canGoForward = diffDays(addDays(weekStart, 7), agendaEnd) >= 0

  const moveWeek = (weeks: number) => setSelectedDate(addDays(selectedDate, weeks * 7))

  const dayAppointments = useMemo(() => appointmentsOn(appointments, selectedDate), [appointments, selectedDate])
  const openNew = (defaults: NewAppointmentDefaults = {}) => setNewDefaults({ date: selectedDate, ...defaults })

  const sheets = (
    <>
      <AppointmentSheet appointmentId={openId} onClose={() => setOpenId(null)} />
      <NewAppointmentSheet
        open={newDefaults !== null}
        defaults={newDefaults ?? undefined}
        onClose={() => setNewDefaults(null)}
        onCreated={(a) => setSelectedDate(a.date)}
      />
    </>
  )

  return (
    <>
      <PageHeader
        title="Agenda"
        description={formatDayTitle(selectedDate, today)}
        actions={
          <Button variant="accent" onClick={() => openNew()} className="max-md:hidden">
            <Plus className="size-5" />
            Nueva cita
          </Button>
        }
      />

      <WeekNav
        weekStart={weekStart}
        today={today}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onMove={moveWeek}
        onToday={() => setSelectedDate(today)}
      />

      {/* Móvil y tablet: un día a la vez */}
      <div className="xl:hidden">
        <DayStrip
          weekStart={weekStart}
          selected={selectedDate}
          today={today}
          appointments={appointments}
          onSelect={setSelectedDate}
        />
        <DaySummary appointments={dayAppointments} />
        {dayAppointments.length === 0 ? (
          <Card>
            <EmptyState
              icon={CalendarX}
              title="Día libre"
              description="No hay citas agendadas para este día. Tocá abajo para agendar la primera."
              action={
                <Button variant="accent" onClick={() => openNew()}>
                  <CalendarPlus className="size-5" />
                  Agendar cita
                </Button>
              }
            />
          </Card>
        ) : (
          <DayTimeline
            date={selectedDate}
            isToday={selectedDate === today}
            appointments={dayAppointments}
            highlightId={lastAddedId}
            onSelect={(a) => setOpenId(a.id)}
            onSlot={(start) => openNew({ start })}
          />
        )}
      </div>

      {/* PC: semana completa */}
      <div className="hidden xl:block">
        <WeekCalendar
          weekStart={weekStart}
          today={today}
          selected={selectedDate}
          appointments={appointments}
          highlightId={lastAddedId}
          onSelect={(a) => setOpenId(a.id)}
          onSelectDay={setSelectedDate}
          onSlot={(date, start) => openNew({ date, start })}
        />
      </div>

      {/* Botón flotante en móvil */}
      <button
        type="button"
        onClick={() => openNew()}
        className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 flex h-14 items-center gap-2 rounded-full bg-accent pr-5 pl-4 font-semibold text-white shadow-overlay transition-transform active:scale-95 md:hidden"
      >
        <Plus className="size-6" />
        Nueva cita
      </button>

      {sheets}
    </>
  )
}

function WeekNav({
  weekStart,
  today,
  canGoBack,
  canGoForward,
  onMove,
  onToday,
}: {
  weekStart: DateKey
  today: DateKey
  canGoBack: boolean
  canGoForward: boolean
  onMove: (weeks: number) => void
  onToday: () => void
}) {
  const isCurrentWeek = weekStart === startOfWeek(today)
  const navButton =
    'grid size-9 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent'
  return (
    <div className="mb-3 flex items-center gap-1">
      <button type="button" className={navButton} onClick={() => onMove(-1)} disabled={!canGoBack} aria-label="Semana anterior">
        <ChevronLeft className="size-5" />
      </button>
      <p className="min-w-0 flex-1 text-center text-sm font-semibold text-slate-700 xl:flex-none xl:px-2">
        {formatShortDate(weekStart)} – {formatShortDate(addDays(weekStart, 6))}
      </p>
      <button type="button" className={navButton} onClick={() => onMove(1)} disabled={!canGoForward} aria-label="Semana siguiente">
        <ChevronRight className="size-5" />
      </button>
      <button
        type="button"
        onClick={onToday}
        className={cn(
          'ml-1 h-9 rounded-full border border-slate-200 bg-surface px-3.5 text-sm font-medium text-slate-700 shadow-card transition-opacity hover:bg-slate-50',
          isCurrentWeek && 'xl:invisible',
        )}
      >
        Hoy
      </button>
    </div>
  )
}

function DayStrip({
  weekStart,
  selected,
  today,
  appointments,
  onSelect,
}: {
  weekStart: DateKey
  selected: DateKey
  today: DateKey
  appointments: Appointment[]
  onSelect: (date: DateKey) => void
}) {
  return (
    <div className="mb-4 grid grid-cols-7 gap-1 rounded-2xl border border-slate-200/80 bg-surface p-1.5 shadow-card">
      {weekDays(weekStart).map((day) => {
        const isSelected = day === selected
        const isToday = day === today
        const count = appointments.filter((a) => a.date === day).length
        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelect(day)}
            aria-pressed={isSelected}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-xl py-2 transition-all duration-200',
              isSelected ? 'bg-accent text-white shadow-raised' : 'text-slate-600 hover:bg-slate-50',
            )}
          >
            <span className={cn('text-[11px] font-medium capitalize', isSelected ? 'text-white/85' : 'text-slate-400')}>
              {formatWeekdayShort(day)}
            </span>
            <span className={cn('text-lg leading-tight font-semibold tabular-nums', !isSelected && isToday && 'text-accent')}>
              {Number(day.slice(8))}
            </span>
            <span className="flex h-1.5 gap-0.5" aria-label={`${count} citas`}>
              {Array.from({ length: Math.min(count, 3) }, (_, i) => (
                <span key={i} className={cn('size-1 rounded-full', isSelected ? 'bg-white/80' : 'bg-accent/60')} />
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function DaySummary({ appointments }: { appointments: Appointment[] }) {
  if (appointments.length === 0) return null
  const done = appointments.filter((a) => a.status === 'completada').length
  const pending = appointments.filter((a) => a.status === 'pendiente').length
  const total = appointments.reduce((sum, a) => sum + priceOf(a), 0)
  const chips = [
    `${appointments.length} citas`,
    done ? `${done} completadas` : null,
    pending ? `${pending} por confirmar` : null,
    `${formatColones(total)} en servicios`,
  ]
  return <InfoChips items={chips} className="mb-4" />
}

function DayTimeline({
  date,
  isToday,
  appointments,
  highlightId,
  onSelect,
  onSlot,
}: {
  date: DateKey
  isToday: boolean
  appointments: Appointment[]
  highlightId: string | null
  onSelect: (a: Appointment) => void
  onSlot: (start: number) => void
}) {
  const clientMap = useClientMap()
  const now = useNowMinutes()
  const placements = useMemo(() => layoutLanes(appointments), [appointments])
  const height = (CLOSE_MINUTE - OPEN_MINUTE) * DAY_PX

  return (
    <Card key={date} className="animate-fade-in px-2 py-5 md:px-4">
      <div className="flex">
        <HourLabels pxPerMinute={DAY_PX} className="w-16" />
        <div
          className="relative flex-1 cursor-copy"
          style={{ height }}
          onClick={(e) => onSlot(minuteFromClick(e, DAY_PX))}
          title="Tocá un espacio libre para agendar"
        >
          <HourLines pxPerMinute={DAY_PX} />
          {isToday && <NowLine pxPerMinute={DAY_PX} now={now} />}
          {placements.map((p) => (
            <AppointmentBlock
              key={p.appointment.id}
              placement={p}
              client={clientMap.get(p.appointment.clientId)}
              pxPerMinute={DAY_PX}
              highlight={p.appointment.id === highlightId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}

function WeekCalendar({
  weekStart,
  today,
  selected,
  appointments,
  highlightId,
  onSelect,
  onSelectDay,
  onSlot,
}: {
  weekStart: DateKey
  today: DateKey
  selected: DateKey
  appointments: Appointment[]
  highlightId: string | null
  onSelect: (a: Appointment) => void
  onSelectDay: (date: DateKey) => void
  onSlot: (date: DateKey, start: number) => void
}) {
  const clientMap = useClientMap()
  const now = useNowMinutes()
  const days = weekDays(weekStart)
  const height = (CLOSE_MINUTE - OPEN_MINUTE) * WEEK_PX

  return (
    <Card key={weekStart} className="animate-fade-in overflow-hidden">
      <div className="grid grid-cols-[4rem_repeat(7,minmax(0,1fr))] border-b border-slate-200/80">
        <div />
        {days.map((day) => {
          const count = appointments.filter((a) => a.date === day).length
          const isToday = day === today
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                'border-l border-slate-100 px-2 py-3 text-left transition-colors hover:bg-slate-50',
                day === selected && 'bg-accent-soft/60 hover:bg-accent-soft',
              )}
            >
              <span className="block text-xs font-medium text-slate-500 capitalize">{formatWeekdayShort(day)}</span>
              <span className="mt-0.5 flex items-center gap-2">
                <span
                  className={cn(
                    'grid size-8 place-items-center rounded-full text-lg font-semibold tabular-nums',
                    isToday ? 'bg-accent text-white' : 'text-slate-900',
                  )}
                >
                  {Number(day.slice(8))}
                </span>
                <span className="text-xs text-slate-400">{count ? `${count} citas` : 'Libre'}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div className="grid grid-cols-[4rem_repeat(7,minmax(0,1fr))] py-4">
        <HourLabels pxPerMinute={WEEK_PX} />
        {days.map((day) => {
          const placements = layoutLanes(appointmentsOn(appointments, day))
          return (
            <div
              key={day}
              className={cn('relative cursor-copy border-l border-slate-100', day === today && 'bg-accent-soft/30')}
              style={{ height }}
              onClick={(e) => onSlot(day, minuteFromClick(e, WEEK_PX))}
            >
              <HourLines pxPerMinute={WEEK_PX} />
              {day === today && <NowLine pxPerMinute={WEEK_PX} now={now} />}
              {placements.map((p) => (
                <AppointmentBlock
                  key={p.appointment.id}
                  placement={p}
                  client={clientMap.get(p.appointment.clientId)}
                  pxPerMinute={WEEK_PX}
                  compact
                  highlight={p.appointment.id === highlightId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
