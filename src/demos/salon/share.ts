import type { Receipt } from '../../components/share/receiptContext'
import type { WhatsAppDraft } from '../../components/share/WhatsAppSheet'
import { getService, getStaff, type Appointment, type Client } from '../../data/salon'
import { fromDateKey, type DateKey } from '../../lib/date'
import { formatDayTitle, formatDuration, formatTime } from '../../lib/format'

/** Mensaje de recordatorio de cita, como lo escribiría el salón. */
export function reminderDraft(appointment: Appointment, client: Client | undefined, today: DateKey): WhatsAppDraft {
  const service = getService(appointment.serviceId)
  const name = client?.name ?? 'Clienta'
  return {
    to: name,
    phone: client?.phone,
    sendLabel: 'Enviar recordatorio',
    sentToast: 'Recordatorio enviado ✓',
    message: [
      `¡Hola ${name.split(' ')[0]}! 💅`,
      'Te recordamos tu cita en *Studio Valeria*:',
      '',
      `📅 ${formatDayTitle(appointment.date, today)}`,
      `🕑 ${formatTime(appointment.start)}`,
      `✨ ${service.name} con ${getStaff(appointment.staffId).name}`,
      '',
      'Respondé *SÍ* para confirmar o escribinos si necesitás cambiarla. ¡Te esperamos! 💖',
    ].join('\n'),
  }
}

/** Comprobante de una cita ya cobrada. */
export function appointmentReceipt(appointment: Appointment, clientName: string): Receipt | null {
  if (!appointment.payment) return null
  const service = getService(appointment.serviceId)
  const paidAt = fromDateKey(appointment.date)
  paidAt.setMinutes(appointment.payment.paidAt)
  return {
    id: appointment.id,
    paidAt,
    customer: clientName,
    lines: [
      {
        name: service.name,
        detail: `Con ${getStaff(appointment.staffId).name} · ${formatDuration(service.duration)}`,
        qty: 1,
        price: appointment.payment.amount,
      },
    ],
    total: appointment.payment.amount,
    method: appointment.payment.method,
  }
}
