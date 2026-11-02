import type { Receipt } from '../../components/share/receiptContext'
import type { WhatsAppDraft } from '../../components/share/WhatsAppSheet'
import { paymentMethods, type PaymentMethod } from '../../data/payments'
import { getMenuItem, type Sale } from '../../data/soda'
import { formatClock, formatColones } from '../../lib/format'
import { topDishes } from './selectors'

export function saleReceipt(sale: Sale): Receipt {
  return {
    id: sale.id,
    paidAt: new Date(sale.paidAt),
    reference: `Mesa ${sale.tableId}`,
    lines: sale.lines.map((l) => ({ name: getMenuItem(l.itemId).name, qty: l.qty, price: l.price })),
    total: sale.total,
    method: sale.method,
  }
}

/** Resumen del día para el grupo de WhatsApp del negocio. */
export function closingDraft(sales: Sale[], openAmount: number): WhatsAppDraft {
  const total = sales.reduce((sum, s) => sum + s.total, 0)
  const byMethod = (Object.keys(paymentMethods) as PaymentMethod[]).map(
    (method) => `• ${paymentMethods[method]}: ${formatColones(sales.filter((s) => s.method === method).reduce((sum, s) => sum + s.total, 0))}`,
  )
  const top = topDishes(sales, 3).map((row, i) => `${i + 1}. ${getMenuItem(row.itemId).name} (${row.qty})`)
  return {
    to: 'Equipo Soda La Esquina',
    sendLabel: 'Enviar resumen',
    sentToast: 'Resumen enviado ✓',
    message: [
      `📊 *Cierre de Soda La Esquina* · ${formatClock(Date.now())}`,
      '',
      `💰 Ventas: *${formatColones(total)}* en ${sales.length} cuentas`,
      ...byMethod,
      openAmount ? `🍽️ Por cobrar en mesas: ${formatColones(openAmount)}` : '🍽️ Todas las mesas cobradas',
      '',
      '🏆 Lo más vendido:',
      ...top,
    ].join('\n'),
  }
}
