import { createContext, useContext } from 'react'
import type { PaymentMethod } from '../../data/payments'

export interface ReceiptLine {
  name: string
  /** "Color Negro · Talla M", "Con Valeria"… */
  detail?: string
  qty: number
  price: number
}

export interface Receipt {
  /** Semilla del número de comprobante (id de la venta o la cita). */
  id: string
  /** Fecha y hora del cobro. */
  paidAt: Date
  customer?: string
  /** Dato extra arriba del detalle: "Mesa 4". */
  reference?: string
  lines: ReceiptLine[]
  total: number
  method: PaymentMethod
}

export type ShowReceipt = (receipt: Receipt) => void

export const ReceiptContext = createContext<ShowReceipt>(() => {})

/** Abre el comprobante de una venta. Vive en DemoLayout, así sigue abierto aunque se cambie de pantalla. */
export function useReceipt(): ShowReceipt {
  return useContext(ReceiptContext)
}

/** Número de comprobante estable a partir del id: "000123". */
export function receiptNumber(id: string): string {
  let hash = 0
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return String((hash % 900_000) + 100_000).padStart(6, '0')
}
