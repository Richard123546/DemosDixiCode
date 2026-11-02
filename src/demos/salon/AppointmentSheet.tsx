import { CalendarDays, CheckCheck, Clock, MessageCircle, Phone, ReceiptText, StickyNote, UserRound, Wallet } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useReceipt } from '../../components/share/receiptContext'
import { WhatsAppSheet } from '../../components/share/WhatsAppSheet'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { useToast } from '../../components/ui/toastContext'
import { getService, getStaff, paymentMethods, type Appointment, type PaymentMethod } from '../../data/salon'
import { diffDays, nowMinutes } from '../../lib/date'
import { formatColones, formatDayTitle, formatDuration, formatTime } from '../../lib/format'
import { shortName } from '../../lib/text'
import { PaymentMethodPicker } from '../../components/payment/PaymentMethodPicker'
import { useClientMap, useSalon } from './salonStore'
import { endOf } from './selectors'
import { appointmentReceipt, reminderDraft } from './share'
import { StatusBadge } from './status'

interface AppointmentSheetProps {
  appointmentId: string | null
  onClose: () => void
  /** Abre directo en el paso de cobro (desde Caja). */
  startWithPayment?: boolean
}

export function AppointmentSheet({ appointmentId, onClose, startWithPayment }: AppointmentSheetProps) {
  const { appointments } = useSalon()
  const appointment = appointments.find((a) => a.id === appointmentId)
  if (!appointment) return null
  return (
    <AppointmentSheetContent
      key={appointment.id}
      appointment={appointment}
      onClose={onClose}
      startWithPayment={startWithPayment}
    />
  )
}

function AppointmentSheetContent({
  appointment,
  onClose,
  startWithPayment,
}: {
  appointment: Appointment
  onClose: () => void
  startWithPayment?: boolean
}) {
  const { today, confirmAppointment, chargeAppointment, remindedIds, markReminded } = useSalon()
  const client = useClientMap().get(appointment.clientId)
  const toast = useToast()
  const showReceipt = useReceipt()
  const [step, setStep] = useState<'detail' | 'pay' | 'remind'>(startWithPayment ? 'pay' : 'detail')
  const [method, setMethod] = useState<PaymentMethod>('sinpe')

  const service = getService(appointment.serviceId)
  const clientName = client?.name ?? 'Clienta'
  const canCharge = appointment.status !== 'completada' && diffDays(appointment.date, today) >= 0

  const reminded = remindedIds.includes(appointment.id)
  const receipt = appointmentReceipt(appointment, clientName)

  const charge = () => {
    chargeAppointment(appointment.id, method)
    toast('Cobro registrado ✓', `${formatColones(service.price)} · ${paymentMethods[method]} · ${shortName(clientName)}`)
    onClose()
    showReceipt(
      appointmentReceipt(
        { ...appointment, payment: { method, amount: service.price, paidAt: nowMinutes() } },
        clientName,
      )!,
    )
  }

  const confirm = () => {
    confirmAppointment(appointment.id)
    toast('Cita confirmada ✓', `${shortName(clientName)} · ${formatTime(appointment.start)}`)
  }

  if (step === 'remind') {
    return (
      <WhatsAppSheet
        draft={reminderDraft(appointment, client, today)}
        onClose={() => setStep('detail')}
        onSent={() => markReminded(appointment.id)}
      />
    )
  }

  if (step === 'pay') {
    return (
      <Sheet
        open
        onClose={onClose}
        title="Cobrar cita"
        description={`${clientName} · ${service.name}`}
        footer={
          <div className="flex gap-2">
            {!startWithPayment && (
              <Button variant="secondary" size="lg" onClick={() => setStep('detail')}>
                Volver
              </Button>
            )}
            <Button variant="accent" size="lg" className="flex-1" onClick={charge}>
              Confirmar cobro de {formatColones(service.price)}
            </Button>
          </div>
        }
      >
        <div className="animate-step-in">
          <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center">
            <p className="text-sm text-slate-500">Total a cobrar</p>
            <p className="mt-1 text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
              {formatColones(service.price)}
            </p>
            <p className="mt-1 text-sm text-slate-500">IVA incluido</p>
          </div>
          <p className="mt-5 mb-2 text-sm font-medium text-slate-700">¿Cómo paga?</p>
          <PaymentMethodPicker value={method} onChange={setMethod} />
          {method === 'sinpe' && (
            <p className="mt-3 text-sm text-slate-500">
              SINPE al <span className="font-medium text-slate-700">8888-0123</span> a nombre de Valeria Rojas.
            </p>
          )}
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={clientName}
      description={service.name}
      footer={
        appointment.status === 'completada' ? (
          <div className="flex gap-2">
            {receipt && (
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => {
                  onClose()
                  showReceipt(receipt)
                }}
              >
                <ReceiptText className="size-5" />
                Comprobante
              </Button>
            )}
            <Button variant="accent" size="lg" className="flex-1" onClick={onClose}>
              Listo
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {appointment.status === 'pendiente' ? (
              <Button variant="secondary" size="lg" className="flex-1" onClick={confirm}>
                Confirmar
              </Button>
            ) : (
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep('remind')}>
                {reminded ? <CheckCheck className="size-5 text-emerald-600" /> : <MessageCircle className="size-5" />}
                {reminded ? 'Recordada' : 'Recordar'}
              </Button>
            )}
            {canCharge && (
              <Button variant="accent" size="lg" className="flex-[1.4]" onClick={() => setStep('pay')}>
                <Wallet className="size-5" />
                Cobrar
              </Button>
            )}
          </div>
        )
      }
    >
      <div className="animate-fade-in">
        <div className="flex items-center gap-3">
          <Avatar name={clientName} size="lg" />
          <div className="min-w-0 flex-1">
            <StatusBadge status={appointment.status} />
            {client && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600">
                <Phone className="size-4 text-slate-400" />
                {client.phone}
              </p>
            )}
          </div>
          <p className="text-xl font-bold text-slate-900 tabular-nums">{formatColones(service.price)}</p>
        </div>

        <dl className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-200">
          <InfoRow icon={CalendarDays} label="Día">
            {formatDayTitle(appointment.date, today)}
          </InfoRow>
          <InfoRow icon={Clock} label="Hora">
            {formatTime(appointment.start)} – {formatTime(endOf(appointment))}
            <span className="text-slate-500"> · {formatDuration(service.duration)}</span>
          </InfoRow>
          <InfoRow icon={UserRound} label="La atiende">
            {getStaff(appointment.staffId).name}
          </InfoRow>
          {appointment.payment && (
            <InfoRow icon={Wallet} label="Pago">
              {paymentMethods[appointment.payment.method]} · {formatTime(appointment.payment.paidAt)}
            </InfoRow>
          )}
        </dl>

        {appointment.status === 'pendiente' && (
          <button
            type="button"
            onClick={() => setStep('remind')}
            className="mt-4 flex w-full items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-left text-sm text-emerald-800 transition-colors hover:bg-emerald-100"
          >
            <MessageCircle className="size-5 shrink-0" />
            <span className="flex-1">
              <span className="block font-semibold">{reminded ? 'Recordatorio enviado' : 'Enviar recordatorio por WhatsApp'}</span>
              <span className="block text-xs opacity-80">Para que confirme su cita sin tener que llamarla.</span>
            </span>
          </button>
        )}

        {client?.notes && (
          <p className="mt-4 flex gap-2 rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
            <StickyNote className="mt-0.5 size-4 shrink-0" />
            {client.notes}
          </p>
        )}
      </div>
    </Sheet>
  )
}

function InfoRow({ icon: Icon, label, children }: { icon: typeof Clock; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
      <dt className="w-20 shrink-0 text-sm text-slate-500">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm font-medium text-slate-900">{children}</dd>
    </div>
  )
}
