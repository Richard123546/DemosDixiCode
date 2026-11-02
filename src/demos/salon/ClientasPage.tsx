import { CalendarPlus, ChevronRight, History, Phone, SearchX, StickyNote, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { SearchInput } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { Sheet } from '../../components/ui/Sheet'
import { getService, getStaff, type Client } from '../../data/salon'
import { cn } from '../../lib/cn'
import { type DateKey } from '../../lib/date'
import {
  formatColones,
  formatDayTitle,
  formatMonthYear,
  formatRelativeDay,
  formatShortDate,
  formatTime,
} from '../../lib/format'
import { normalize } from '../../lib/text'
import { NewAppointmentSheet } from './NewAppointmentSheet'
import { useSalon } from './salonStore'
import { clientStats, priceOf, type ClientStats } from './selectors'
import { StatusBadge } from './status'

interface ClientRow {
  client: Client
  stats: ClientStats
}

export default function ClientasPage() {
  const { clients, appointments, today } = useSalon()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(() => params.get('q') ?? '')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheetId, setSheetId] = useState<string | null>(null)
  const [bookingFor, setBookingFor] = useState<string | null>(null)

  const rows = useMemo<ClientRow[]>(
    () =>
      clients
        .map((client) => ({ client, stats: clientStats(appointments, client.id) }))
        .sort((a, b) => (b.stats.lastVisit ?? '').localeCompare(a.stats.lastVisit ?? '')),
    [clients, appointments],
  )

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    const digits = query.replace(/\D/g, '')
    if (!q) return rows
    return rows.filter(
      ({ client }) => normalize(client.name).includes(q) || (digits && client.phone.replace(/\D/g, '').includes(digits)),
    )
  }, [rows, query])

  const selected = rows.find((r) => r.client.id === (selectedId ?? filtered[0]?.client.id))
  const sheetRow = rows.find((r) => r.client.id === sheetId)

  const noResults = (
    <EmptyState
      icon={SearchX}
      title="No encontramos a nadie"
      description={`No hay clientas que coincidan con “${query}”. Probá con otro nombre o número.`}
      action={
        <Button variant="secondary" onClick={() => setQuery('')}>
          Limpiar búsqueda
        </Button>
      }
    />
  )

  return (
    <>
      <PageHeader title="Clientas" description={`${clients.length} clientas registradas · ordenadas por última visita`} />

      <SearchInput
        placeholder="Buscar por nombre o teléfono"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Buscar clienta"
        className="mb-4 xl:max-w-md"
      />

      {/* Móvil y tablet: lista */}
      <Card className="overflow-hidden xl:hidden">
        {filtered.length === 0 ? (
          noResults
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map(({ client, stats }) => (
              <li key={client.id}>
                <button
                  type="button"
                  onClick={() => setSheetId(client.id)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
                >
                  <Avatar name={client.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-900">{client.name}</span>
                    <span className="block truncate text-sm text-slate-500">
                      {client.phone} · {stats.lastVisit ? formatRelativeDay(stats.lastVisit, today) : 'Sin visitas'}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-semibold text-slate-900 tabular-nums">{formatColones(stats.total)}</span>
                    <span className="block text-xs text-slate-500">{stats.visits.length} visitas</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-slate-300" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* PC: tabla + detalle al lado */}
      <div className="hidden items-start gap-5 xl:grid xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="overflow-hidden">
          {filtered.length === 0 ? (
            noResults
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Clienta</th>
                  <th className="px-3 py-3">Teléfono</th>
                  <th className="px-3 py-3">Última visita</th>
                  <th className="px-3 py-3 text-right">Visitas</th>
                  <th className="px-5 py-3 text-right">Total gastado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(({ client, stats }) => {
                  const isSelected = client.id === selected?.client.id
                  return (
                    <tr
                      key={client.id}
                      onClick={() => setSelectedId(client.id)}
                      className={cn(
                        'cursor-pointer transition-colors',
                        isSelected ? 'bg-accent-soft/70' : 'hover:bg-slate-50',
                      )}
                    >
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-3">
                          <Avatar name={client.name} size="sm" />
                          <span className={cn('font-medium', isSelected ? 'text-accent-ink' : 'text-slate-900')}>
                            {client.name}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-600 tabular-nums">{client.phone}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-600">
                        {stats.lastVisit ? (
                          <>
                            {formatShortDate(stats.lastVisit)}
                            <span className="text-slate-400"> · {formatRelativeDay(stats.lastVisit, today)}</span>
                          </>
                        ) : (
                          <span className="text-slate-400">Sin visitas</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right text-slate-600 tabular-nums">{stats.visits.length}</td>
                      <td className="px-5 py-3 text-right font-semibold whitespace-nowrap text-slate-900 tabular-nums">
                        {formatColones(stats.total)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="sticky top-24 overflow-hidden">
          {selected ? (
            <div key={selected.client.id} className="animate-fade-in p-6">
              <ClientDetail row={selected} today={today} onBook={() => setBookingFor(selected.client.id)} />
            </div>
          ) : (
            <EmptyState icon={UserRound} title="Elegí una clienta" description="Vas a ver aquí su historial completo." />
          )}
        </Card>
      </div>

      <Sheet
        open={!!sheetRow}
        onClose={() => setSheetId(null)}
        title={sheetRow?.client.name ?? ''}
        description={sheetRow ? `Clienta desde ${formatMonthYear(sheetRow.client.since)}` : undefined}
      >
        {sheetRow && (
          <ClientDetail
            row={sheetRow}
            today={today}
            hideHeader
            onBook={() => {
              setSheetId(null)
              setBookingFor(sheetRow.client.id)
            }}
          />
        )}
      </Sheet>

      <NewAppointmentSheet
        open={bookingFor !== null}
        defaults={{ clientId: bookingFor ?? undefined }}
        onClose={() => setBookingFor(null)}
      />
    </>
  )
}

function ClientDetail({
  row,
  today,
  hideHeader,
  onBook,
}: {
  row: ClientRow
  today: DateKey
  hideHeader?: boolean
  onBook: () => void
}) {
  const { client, stats } = row
  const next = stats.upcoming[0]
  const average = stats.visits.length ? stats.total / stats.visits.length : 0

  return (
    <div>
      {!hideHeader && (
        <div className="mb-5 flex items-center gap-3">
          <Avatar name={client.name} size="lg" />
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-slate-900">{client.name}</h2>
            <p className="text-sm text-slate-500">Clienta desde {formatMonthYear(client.since)}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="flex flex-1 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 tabular-nums">
          <Phone className="size-4 text-slate-400" />
          {client.phone}
        </span>
        <Button variant="accent" onClick={onBook}>
          <CalendarPlus className="size-4" />
          Agendar
        </Button>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2">
        {[
          ['Visitas', String(stats.visits.length)],
          ['Total', formatColones(stats.total)],
          ['Promedio', formatColones(average)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 px-3 py-2.5">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-0.5 truncate font-semibold text-slate-900 tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {client.notes && (
        <p className="mt-4 flex gap-2 rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
          <StickyNote className="mt-0.5 size-4 shrink-0" />
          {client.notes}
        </p>
      )}

      {next && (
        <div className="mt-4 rounded-xl border border-accent-muted bg-accent-soft/60 px-3.5 py-3">
          <p className="flex items-center justify-between text-xs font-semibold tracking-wide text-accent-ink uppercase">
            Próxima cita
            <StatusBadge status={next.status} className="normal-case" />
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {formatDayTitle(next.date, today).split(',')[0]}, {formatShortDate(next.date)} · {formatTime(next.start)}
          </p>
          <p className="text-sm text-slate-600">{getService(next.serviceId).name}</p>
        </div>
      )}

      <h3 className="mt-6 mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <History className="size-4 text-slate-400" />
        Historial de servicios
      </h3>
      {stats.visits.length === 0 ? (
        <EmptyState
          icon={History}
          title="Sin visitas todavía"
          description="Cuando se cobre su primera cita, va a aparecer aquí."
          className="py-6"
        />
      ) : (
        <ol className="relative space-y-1 before:absolute before:top-3 before:bottom-3 before:left-[7px] before:w-px before:bg-slate-200">
          {stats.visits.map((visit) => (
            <li key={visit.id} className="relative flex gap-3 py-2 pl-6">
              <span className="absolute top-3.5 left-0.5 size-3 rounded-full border-2 border-surface bg-accent/70 ring-1 ring-accent-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{getService(visit.serviceId).name}</p>
                <p className="text-xs text-slate-500">
                  {formatShortDate(visit.date)} · {formatRelativeDay(visit.date, today)} · con {getStaff(visit.staffId).name}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-700 tabular-nums">{formatColones(priceOf(visit))}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
