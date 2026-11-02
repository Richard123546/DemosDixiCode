import { createContext, useContext } from 'react'
import type { Product, Sale, Size } from '../../data/boutique'
import type { PaymentMethod } from '../../data/payments'
import type { DateKey } from '../../lib/date'

export interface CartLine {
  productId: string
  color: string
  size: Size
  qty: number
}

export interface BoutiqueContextValue {
  today: DateKey
  products: Product[]
  sales: Sale[]
  cart: CartLine[]
  /** Productos con pedido a proveedor ya enviado. */
  requested: string[]
  addToCart: (line: CartLine) => void
  setCartQty: (key: string, qty: number) => void
  removeFromCart: (key: string) => void
  checkout: (method: PaymentMethod) => Sale | null
  requestRestock: (productId: string) => void
}

export const BoutiqueContext = createContext<BoutiqueContextValue | null>(null)

export function useBoutique(): BoutiqueContextValue {
  const value = useContext(BoutiqueContext)
  if (!value) throw new Error('useBoutique debe usarse dentro de BoutiqueProvider')
  return value
}
