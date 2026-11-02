import { LOW_STOCK, type Product, type Sale, type Size } from '../../data/boutique'

export type StockStatus = 'agotado' | 'poco' | 'ok'

export const totalStock = (product: Product) => product.variants.reduce((sum, v) => sum + v.stock, 0)

export const variantStock = (product: Product, color: string, size: Size) =>
  product.variants.find((v) => v.color === color && v.size === size)?.stock ?? 0

export function stockStatus(product: Product): StockStatus {
  const total = totalStock(product)
  if (total === 0) return 'agotado'
  return total <= LOW_STOCK ? 'poco' : 'ok'
}

export const cartKey = (productId: string, color: string, size: Size) => `${productId}|${color}|${size}`

export interface Ranked {
  key: string
  units: number
  revenue: number
}

/** Suma unidades e ingresos agrupando las líneas de venta por la clave dada. */
export function rankSales(sales: Sale[], keyOf: (line: Sale['lines'][number]) => string): Ranked[] {
  const totals = new Map<string, Ranked>()
  for (const sale of sales) {
    for (const line of sale.lines) {
      const key = keyOf(line)
      const row = totals.get(key) ?? { key, units: 0, revenue: 0 }
      row.units += line.qty
      row.revenue += line.qty * line.price
      totals.set(key, row)
    }
  }
  return [...totals.values()].sort((a, b) => b.units - a.units || b.revenue - a.revenue)
}
