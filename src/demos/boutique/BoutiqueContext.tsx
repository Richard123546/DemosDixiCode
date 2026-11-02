import { useState, type ReactNode } from 'react'
import { createBoutiqueSales, initialProducts, type Sale } from '../../data/boutique'
import type { PaymentMethod } from '../../data/payments'
import { nowMinutes, todayKey } from '../../lib/date'
import { BoutiqueContext, type BoutiqueContextValue, type CartLine } from './boutiqueStore'
import { cartKey, variantStock } from './selectors'

const keyOf = (line: CartLine) => cartKey(line.productId, line.color, line.size)

export function BoutiqueProvider({ children }: { children: ReactNode }) {
  const [today] = useState(todayKey)
  const [products, setProducts] = useState(initialProducts)
  const [sales, setSales] = useState(() => createBoutiqueSales(today))
  const [cart, setCart] = useState<CartLine[]>([])
  const [requested, setRequested] = useState<string[]>([])

  const stockFor = (line: CartLine) => {
    const product = products.find((p) => p.id === line.productId)
    return product ? variantStock(product, line.color, line.size) : 0
  }

  // El carrito nunca pide más unidades de las que hay.
  const addToCart = (line: CartLine) =>
    setCart((prev) => {
      const existing = prev.find((l) => keyOf(l) === keyOf(line))
      const qty = Math.min(stockFor(line), (existing?.qty ?? 0) + line.qty)
      if (qty <= 0) return prev
      return existing ? prev.map((l) => (l === existing ? { ...l, qty } : l)) : [...prev, { ...line, qty }]
    })

  const setCartQty = (key: string, qty: number) =>
    setCart((prev) =>
      prev
        .map((l) => (keyOf(l) === key ? { ...l, qty: Math.min(qty, stockFor(l)) } : l))
        .filter((l) => l.qty > 0),
    )

  const removeFromCart = (key: string) => setCart((prev) => prev.filter((l) => keyOf(l) !== key))

  const checkout = (method: PaymentMethod): Sale | null => {
    if (!cart.length) return null
    const lines = cart.map((l) => ({ ...l, price: products.find((p) => p.id === l.productId)!.price }))
    const sale: Sale = {
      id: `v-${Date.now()}`,
      date: today,
      minute: nowMinutes(),
      lines,
      total: lines.reduce((sum, l) => sum + l.qty * l.price, 0),
      method,
    }
    setProducts((prev) =>
      prev.map((product) => {
        const sold = cart.filter((l) => l.productId === product.id)
        if (!sold.length) return product
        return {
          ...product,
          variants: product.variants.map((v) => {
            const line = sold.find((l) => l.color === v.color && l.size === v.size)
            return line ? { ...v, stock: Math.max(0, v.stock - line.qty) } : v
          }),
        }
      }),
    )
    setSales((prev) => [...prev, sale])
    setCart([])
    return sale
  }

  const requestRestock = (productId: string) =>
    setRequested((prev) => (prev.includes(productId) ? prev : [...prev, productId]))

  const value: BoutiqueContextValue = {
    today,
    products,
    sales,
    cart,
    requested,
    addToCart,
    setCartQty,
    removeFromCart,
    checkout,
    requestRestock,
  }

  return <BoutiqueContext.Provider value={value}>{children}</BoutiqueContext.Provider>
}
