import { MessageCircle, Printer } from 'lucide-react'
import { createPortal } from 'react-dom'
import { paymentMethods } from '../../data/payments'
import type { Demo } from '../../data/demos'
import { cn } from '../../lib/cn'
import { formatClock, formatColones } from '../../lib/format'
import { useDemo } from '../layout/DemoContext'
import { Button } from '../ui/Button'
import { Sheet } from '../ui/Sheet'
import { useToast } from '../ui/toastContext'
import { receiptNumber, type Receipt } from './receiptContext'

const IVA = 0.13

const dateFormat = new Intl.DateTimeFormat('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' })

/** Texto plano del comprobante para mandarlo por WhatsApp. */
function receiptText(demo: Demo, receipt: Receipt): string {
  const lines = receipt.lines.map((l) => `• ${l.qty} × ${l.name}${l.detail ? ` (${l.detail})` : ''}: ${formatColones(l.qty * l.price)}`)
  return [
    `*${demo.businessName}* · Comprobante N.º ${receiptNumber(receipt.id)}`,
    `${dateFormat.format(receipt.paidAt)} · ${formatClock(receipt.paidAt.getTime())}`,
    receipt.customer && `Cliente: ${receipt.customer}`,
    receipt.reference,
    '',
    ...lines,
    '',
    `*Total: ${formatColones(receipt.total)}* (${paymentMethods[receipt.method]}, IVA incluido)`,
    '',
    '¡Gracias por su compra! 🙌',
  ]
    .filter((line) => line !== undefined)
    .join('\n')
    .replace(/ /g, ' ')
}

export function ReceiptSheet({ receipt, onClose }: { receipt: Receipt | null; onClose: () => void }) {
  const demo = useDemo()
  const toast = useToast()
  if (!receipt) return null

  const share = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(receiptText(demo, receipt))}`, '_blank', 'noopener,noreferrer')
    toast('Abriendo WhatsApp ✓', 'Elegí el contacto y el comprobante va listo.')
  }

  return (
    <>
      <Sheet
        open
        onClose={onClose}
        title="Comprobante de venta"
        description={`N.º ${receiptNumber(receipt.id)} · ${formatColones(receipt.total)}`}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" size="lg" onClick={() => window.print()}>
              <Printer className="size-5" />
              <span className="max-[379px]:sr-only">Imprimir</span>
            </Button>
            <Button variant="whatsapp" size="lg" className="flex-1" onClick={share}>
              <MessageCircle className="size-5" />
              Compartir por WhatsApp
            </Button>
          </div>
        }
      >
        <div className="rounded-2xl bg-slate-100 p-3 md:p-4">
          <ReceiptPaper demo={demo} receipt={receipt} className="animate-pop-in shadow-raised" />
        </div>
      </Sheet>
      {createPortal(
        <div className="print-only">
          <ReceiptPaper demo={demo} receipt={receipt} className="mx-auto max-w-sm" />
        </div>,
        document.body,
      )}
    </>
  )
}

/** El comprobante como papel de impresora térmica; se usa en pantalla y al imprimir. */
function ReceiptPaper({ demo, receipt, className }: { demo: Demo; receipt: Receipt; className?: string }) {
  const Icon = demo.icon
  const base = receipt.total / (1 + IVA)
  return (
    <div className={cn('rounded-xl bg-surface px-5 py-6 font-mono text-[13px] leading-relaxed text-slate-800', className)}>
      <div className="text-center font-sans">
        <span className="mx-auto grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
          <Icon className="size-5" />
        </span>
        <p className="mt-2 text-base font-bold text-slate-900">{demo.businessName}</p>
        <p className="text-xs text-slate-500">
          {demo.businessType} · {demo.location} · Tel. {demo.phone}
        </p>
      </div>

      <Divider />
      <Row label="Comprobante" value={`N.º ${receiptNumber(receipt.id)}`} />
      <Row label="Fecha" value={`${dateFormat.format(receipt.paidAt)} ${formatClock(receipt.paidAt.getTime())}`} />
      {receipt.customer && <Row label="Cliente" value={receipt.customer} />}
      {receipt.reference && <Row label="Referencia" value={receipt.reference} />}
      <Divider />

      <ul className="space-y-1.5">
        {receipt.lines.map((line, i) => (
          <li key={i}>
            <div className="flex justify-between gap-3">
              <span className="min-w-0">
                {line.qty} × {line.name}
              </span>
              <span className="shrink-0 tabular-nums">{formatColones(line.qty * line.price)}</span>
            </div>
            {line.detail && <p className="text-xs text-slate-500">{line.detail}</p>}
          </li>
        ))}
      </ul>

      <Divider />
      <Row label="Subtotal" value={formatColones(base)} />
      <Row label="IVA 13 %" value={formatColones(receipt.total - base)} />
      <div className="mt-1 flex justify-between text-base font-bold text-slate-900">
        <span>TOTAL</span>
        <span className="tabular-nums">{formatColones(receipt.total)}</span>
      </div>
      <Row label="Pago" value={paymentMethods[receipt.method]} />
      <Divider />

      <p className="text-center font-sans text-sm font-semibold text-slate-900">¡Gracias por su compra!</p>
      <p className="mt-1 text-center font-sans text-[11px] text-slate-400">Comprobante de demostración · sin valor fiscal</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

function Divider() {
  return <div className="my-3 border-t border-dashed border-slate-300" />
}
