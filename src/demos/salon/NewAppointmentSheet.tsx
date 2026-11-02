import { CalendarCheck2, UserPlus } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/Field'
import { Sheet } from '../../components/ui/Sheet'
import { useToast } from '../../components/ui/toastContext'
import {
  CLOSE_MINUTE,
  getService,
  getStaff,
  OPEN_MINUTE,
  serviceCategories,
  services,
  type Appointment,
} from '../../data/salon'
import { addDays, diffDays, type DateKey } from '../../lib/date'
import { formatColones, formatDayTitle, formatDuration, formatShortDate, formatTime, formatWeekdayShort } from '../../lib/format'
import { shortName } from '../../lib/text'
import { useSalon } from './salonStore'
import { findFreeStaff } from './selectors'
import { useNowMinutes } from './timelineUtils'

export interface NewAppointmentDefaults {
  date?: DateKey
  start?: number
  serviceId?: string
  clientId?: string
}

interface NewAppointmentSheetProps {
  open: boolean
  onClose: () => void
  defaults?: NewAppointmentDefaults
  onCreated?: (appointment: Appointment) => void
}

export function NewAppointmentSheet({ open, ...props }: NewAppointmentSheetProps) {
  if (!open) return null
  return <NewAppointmentForm {...props} />
}

const NEW_CLIENT = 'nueva'

function NewAppointmentForm({ onClose, defaults, onCreated }: Omit<NewAppointmentSheetProps, 'open'>) {
  const { today, agendaEnd, clients, appointments, addClient, addAppointment } = useSalon()
  const toast = useToast()
  const now = useNowMinutes()

  const firstDay = defaults?.date && diffDays(today, defaults.date) >= 0 ? defaults.date : today
  const [clientId, setClientId] = useState(defaults?.clientId ?? '')
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [serviceId, setServiceId] = useState(defaults?.serviceId ?? '')
  const [date, setDate] = useState<DateKey>(firstDay)
  const [start, setStart] = useState<number | ''>(defaults?.start ?? '')
  const [submitted, setSubmitted] = useState(false)

  const service = serviceId ? getService(serviceId) : null
  const sortedClients = useMemo(() => [...clients].sort((a, b) => a.name.localeCompare(b.name, 'es')), [clients])

  const days = useMemo(() => {
    const list: DateKey[] = []
    for (let d = today; diffDays(d, agendaEnd) >= 0; d = addDays(d, 1)) list.push(d)
    return list
  }, [today, agendaEnd])

  const slots = useMemo(() => {
    if (!service) return []
    const list: Array<{ minute: number; staffId: string | null; past: boolean }> = []
    for (let m = OPEN_MINUTE; m + service.duration <= CLOSE_MINUTE; m += 15) {
      list.push({
        minute: m,
        staffId: findFreeStaff(appointments, date, m, service.duration),
        past: date === today && m < now,
      })
    }
    return list
  }, [service, appointments, date, today, now])

  const chosenSlot = slots.find((s) => s.minute === start)
  const slotAvailable = !!chosenSlot && !!chosenSlot.staffId && !chosenSlot.past

  const errors = {
    client: !clientId ? 'Elegí una clienta.' : clientId === NEW_CLIENT && !newName.trim() ? 'Escribí el nombre.' : '',
    service: !serviceId ? 'Elegí un servicio.' : '',
    time:
      start === ''
        ? 'Elegí una hora.'
        : !slotAvailable
          ? 'Ese horario ya no está disponible con este servicio. Elegí otro.'
          : '',
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (errors.client || errors.service || errors.time || !chosenSlot?.staffId || start === '') return

    const finalClientId = clientId === NEW_CLIENT ? addClient(newName, newPhone).id : clientId
    const name = clientId === NEW_CLIENT ? newName : (clients.find((c) => c.id === clientId)?.name ?? '')
    const appointment = addAppointment({ clientId: finalClientId, serviceId, date, start, staffId: chosenSlot.staffId })
    toast('Cita agendada', `${shortName(name.trim())} · ${formatDayTitle(date, today).split(',')[0]}, ${formatTime(start)}`)
    onCreated?.(appointment)
    onClose()
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title="Nueva cita"
      description="Solo se muestran los horarios libres."
      footer={
        <Button type="submit" form="new-appointment" variant="accent" size="lg" className="w-full">
          <CalendarCheck2 className="size-5" />
          Agendar cita
        </Button>
      }
    >
      <form id="new-appointment" onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Clienta" htmlFor="na-client" error={submitted ? errors.client : undefined}>
          <Select id="na-client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="" disabled>
              Elegí una clienta…
            </option>
            <option value={NEW_CLIENT}>+ Clienta nueva</option>
            {sortedClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        {clientId === NEW_CLIENT && (
          <div className="grid animate-fade-in gap-3 rounded-2xl bg-accent-soft/60 p-3 sm:grid-cols-2">
            <p className="flex items-center gap-2 text-sm font-medium text-accent-ink sm:col-span-2">
              <UserPlus className="size-4" />
              Se va a guardar en Clientas
            </p>
            <Input
              aria-label="Nombre completo"
              placeholder="Nombre completo"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <Input
              aria-label="Teléfono"
              placeholder="Teléfono (8888-8888)"
              inputMode="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
          </div>
        )}

        <Field label="Servicio" htmlFor="na-service" error={submitted ? errors.service : undefined}>
          <Select id="na-service" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            <option value="" disabled>
              Elegí un servicio…
            </option>
            {serviceCategories.map((category) => (
              <optgroup key={category} label={category}>
                {services
                  .filter((s) => s.category === category)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {formatColones(s.price)}
                    </option>
                  ))}
              </optgroup>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Día" htmlFor="na-date">
            <Select id="na-date" value={date} onChange={(e) => setDate(e.target.value)}>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d === today ? 'Hoy' : `${formatWeekdayShort(d)} ${formatShortDate(d)}`}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Hora" htmlFor="na-time">
            <Select
              id="na-time"
              value={start}
              disabled={!service}
              onChange={(e) => setStart(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="" disabled>
                {service ? 'Elegí…' : 'Primero el servicio'}
              </option>
              {slots.map((s) => (
                <option key={s.minute} value={s.minute} disabled={!s.staffId || s.past}>
                  {formatTime(s.minute)}
                  {s.past ? ' · ya pasó' : !s.staffId ? ' · ocupado' : ''}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {submitted && errors.time && <p className="-mt-2 text-sm text-red-600">{errors.time}</p>}

        {service && slotAvailable && start !== '' && (
          <div className="flex animate-fade-in items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <div className="text-sm">
              <p className="font-medium text-slate-900">
                {formatTime(start)} – {formatTime(start + service.duration)}
              </p>
              <p className="text-slate-500">
                {formatDuration(service.duration)} · la atiende {getStaff(chosenSlot!.staffId!).name}
              </p>
            </div>
            <p className="text-lg font-bold text-slate-900 tabular-nums">{formatColones(service.price)}</p>
          </div>
        )}
      </form>
    </Sheet>
  )
}
