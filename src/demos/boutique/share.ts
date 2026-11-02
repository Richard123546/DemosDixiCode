import type { Receipt } from '../../components/share/receiptContext'
import type { WhatsAppDraft } from '../../components/share/WhatsAppSheet'
import { getProductInfo, type Product, type Sale } from '../../data/boutique'
import { fromDateKey } from '../../lib/date'

export function saleReceipt(sale: Sale): Receipt {
  const paidAt = fromDateKey(sale.date)
  paidAt.setMinutes(sale.minute)
  return {
    id: sale.id,
    paidAt,
    lines: sale.lines.map((l) => ({
      name: getProductInfo(l.productId).name,
      detail: l.size === 'Única' ? l.color : `${l.color} · Talla ${l.size}`,
      qty: l.qty,
      price: l.price,
    })),
    total: sale.total,
    method: sale.method,
  }
}

/** Pedido de reposición tal como se le manda al proveedor. */
export function restockDraft(product: Product, supplier: string, units: number): WhatsAppDraft {
  const oneSize = product.sizes[0] === 'Única'
  return {
    to: supplier,
    sendLabel: 'Enviar pedido',
    sentToast: 'Pedido enviado al proveedor ✓',
    message: [
      '¡Hola! Les escribe *Boutique Amara* 🛍️',
      'Queremos hacer este pedido:',
      '',
      `👗 *${product.name}*`,
      ...product.colors.map((c) =>
        oneSize ? `• ${c.name}: 3 unidades` : `• ${c.name}: 2 por talla (${product.sizes.join(', ')})`,
      ),
      '',
      `Total: ${units} unidades. ¿Nos confirman disponibilidad y fecha de entrega? ¡Gracias!`,
    ].join('\n'),
  }
}
