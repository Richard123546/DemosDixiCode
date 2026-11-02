import { createContext, useContext } from 'react'
import type { PaymentMethod } from '../../data/payments'
import type { KitchenTicket, Sale, Table } from '../../data/soda'

export interface SodaContextValue {
  tables: Table[]
  tickets: KitchenTicket[]
  sales: Sale[]
  yesterdaySales: Sale[]
  addItem: (tableId: number, itemId: string) => void
  removeItem: (tableId: number, itemId: string) => void
  /** Devuelve la comanda creada, o null si no había nada nuevo. */
  sendToKitchen: (tableId: number) => KitchenTicket | null
  markReady: (ticketId: string) => void
  chargeTable: (tableId: number, method: PaymentMethod) => Sale | null
}

export const SodaContext = createContext<SodaContextValue | null>(null)

export function useSoda(): SodaContextValue {
  const value = useContext(SodaContext)
  if (!value) throw new Error('useSoda debe usarse dentro de SodaProvider')
  return value
}
