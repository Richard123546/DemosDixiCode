import { useEffect, useRef } from 'react'
import { CLOSE_MINUTE, getService, getStaff, OPEN_MINUTE, type Appointment, type Client } from '../../data/salon'
import { cn } from '../../lib/cn'
import { formatDuration, formatHour, formatTime } from '../../lib/format'
import { shortName } from '../../lib/text'
import { endOf } from './selectors'
import { statusStyles } from './statusStyles'
import { HOURS, type Placement } from './timelineUtils'

export function HourLines({ pxPerMinute }: { pxPerMinute: number }) {
  return (
    <>
      {HOURS.map((hour) => (
        <div key={hour}>
          <div
            className="pointer-events-none absolute inset-x-0 border-t border-slate-100"
            style={{ top: (hour * 60 - OPEN_MINUTE) * pxPerMinute }}
          />
          {hour * 60 < CLOSE_MINUTE && (
            <div
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-slate-100/70"
              style={{ top: (hour * 60 + 30 - OPEN_MINUTE) * pxPerMinute }}
            />
          )}
        </div>
      ))}
    </>
  )
}

export function HourLabels({ pxPerMinute, className }: { pxPerMinute: number; className?: string }) {
  return (
    <div className={cn('relative shrink-0', className)} style={{ height: (CLOSE_MINUTE - OPEN_MINUTE) * pxPerMinute }}>
      {HOURS.map((hour) => (
        <span
          key={hour}
          className="absolute right-2 -translate-y-1/2 text-[11px] font-medium whitespace-nowrap text-slate-400 tabular-nums"
          style={{ top: (hour * 60 - OPEN_MINUTE) * pxPerMinute }}
        >
          {formatHour(hour)}
        </span>
      ))}
    </div>
  )
}

export function NowLine({ pxPerMinute, now, showDot = true }: { pxPerMinute: number; now: number; showDot?: boolean }) {
  if (now < OPEN_MINUTE || now > CLOSE_MINUTE) return null
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
      style={{ top: (now - OPEN_MINUTE) * pxPerMinute }}
      aria-hidden
    >
      {showDot && <span className="-ml-1 size-2.5 rounded-full bg-red-500 ring-2 ring-surface" />}
      <span className="h-0.5 flex-1 bg-red-500/80" />
    </div>
  )
}

interface AppointmentBlockProps {
  placement: Placement
  client: Client | undefined
  pxPerMinute: number
  compact?: boolean
  highlight?: boolean
  onSelect: (appointment: Appointment) => void
}

export function AppointmentBlock({ placement, client, pxPerMinute, compact, highlight, onSelect }: AppointmentBlockProps) {
  const { appointment, lane, lanes } = placement
  const ref = useRef<HTMLButtonElement>(null)
  const service = getService(appointment.serviceId)
  const style = statusStyles[appointment.status]
  const StatusIcon = style.icon
  const height = service.duration * pxPerMinute - 3
  const name = client ? shortName(client.name) : 'Clienta'

  useEffect(() => {
    if (highlight) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlight])

  const rows = compact ? (height >= 56 ? 3 : height >= 34 ? 2 : 1) : height >= 72 ? 3 : height >= 46 ? 2 : 1

  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onSelect(appointment)
      }}
      className={cn(
        'group absolute flex overflow-hidden rounded-lg border text-left transition-[transform,box-shadow,border-color] duration-200 hover:z-10 hover:shadow-raised active:scale-[0.98]',
        style.card,
        highlight && 'z-10 animate-pop-in ring-2 ring-accent ring-offset-2',
      )}
      style={{
        top: (appointment.start - OPEN_MINUTE) * pxPerMinute + 1,
        height,
        left: `calc(${(lane / lanes) * 100}% + 2px)`,
        width: `calc(${100 / lanes}% - 4px)`,
      }}
    >
      <span className={cn('w-1 shrink-0', style.bar)} />
      <span className={cn('min-w-0 flex-1', compact ? 'px-1.5 py-1' : 'px-2.5 py-1.5')}>
        {rows === 1 ? (
          <span className="flex items-center gap-1 truncate text-xs leading-tight">
            <span className="truncate font-semibold text-slate-900">{name}</span>
            <span className="shrink-0 text-slate-500">{formatTime(appointment.start)}</span>
          </span>
        ) : (
          <>
            <span className="flex items-center gap-1.5">
              <span className={cn('truncate font-semibold text-slate-900', compact ? 'text-xs' : 'text-sm')}>
                {name}
              </span>
              {!compact && <StatusIcon className="ml-auto size-3.5 shrink-0 text-slate-500" />}
            </span>
            <span className={cn('block truncate text-slate-600', compact ? 'text-[11px]' : 'text-xs')}>
              {rows === 2
                ? `${formatTime(appointment.start)} · ${service.name}`
                : `${formatTime(appointment.start)} – ${formatTime(endOf(appointment))}`}
            </span>
            {rows === 3 && (
              <span className={cn('block truncate text-slate-500', compact ? 'text-[11px]' : 'text-xs')}>
                {service.name}
                {!compact && ` · ${formatDuration(service.duration)} · ${getStaff(appointment.staffId).name}`}
              </span>
            )}
          </>
        )}
      </span>
    </button>
  )
}
