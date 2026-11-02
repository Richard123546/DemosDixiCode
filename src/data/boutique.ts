import { addDays, diffDays, fromDateKey, startOfWeek, type DateKey } from '../lib/date'
import { createRng } from '../lib/random'
import type { PaymentMethod } from './payments'

export type ProductCategory = 'Blusas' | 'Jeans' | 'Vestidos' | 'Enaguas' | 'Accesorios'
export type Size = 'S' | 'M' | 'L' | 'XL' | 'Única'
/** Silueta que se dibuja como "foto" del producto. */
export type GarmentKind = 'top' | 'pants' | 'shorts' | 'dress' | 'skirt' | 'bag' | 'necklace' | 'earrings'

export interface ProductColor {
  name: string
  hex: string
}

export interface Variant {
  color: string
  size: Size
  stock: number
}

export interface Product {
  id: string
  name: string
  category: ProductCategory
  kind: GarmentKind
  price: number
  colors: ProductColor[]
  sizes: Size[]
  variants: Variant[]
}

export interface SaleLine {
  productId: string
  color: string
  size: Size
  qty: number
  price: number
}

export interface Sale {
  id: string
  date: DateKey
  /** Minutos desde medianoche */
  minute: number
  lines: SaleLine[]
  total: number
  method: PaymentMethod
}

export const categories: ProductCategory[] = ['Blusas', 'Jeans', 'Vestidos', 'Enaguas', 'Accesorios']
export const LOW_STOCK = 2

const c = {
  blanco: { name: 'Blanco', hex: '#f5f5f4' },
  negro: { name: 'Negro', hex: '#1c1917' },
  beige: { name: 'Beige', hex: '#e2d1b8' },
  oliva: { name: 'Verde oliva', hex: '#6b7a4b' },
  champana: { name: 'Champaña', hex: '#e6cfa8' },
  vino: { name: 'Vino', hex: '#7f1d3a' },
  rosaPalo: { name: 'Rosa palo', hex: '#efc3c3' },
  celeste: { name: 'Celeste', hex: '#9cc3e6' },
  terracota: { name: 'Terracota', hex: '#c46a4a' },
  crema: { name: 'Crema', hex: '#f1e6cf' },
  azulClaro: { name: 'Azul claro', hex: '#8fb2d6' },
  azulMedio: { name: 'Azul medio', hex: '#4a6fa5' },
  azulOscuro: { name: 'Azul oscuro', hex: '#1e3a5f' },
  crudo: { name: 'Crudo', hex: '#e6dfcf' },
  marino: { name: 'Azul marino', hex: '#1e2a4a' },
  salvia: { name: 'Verde salvia', hex: '#9cae94' },
  amarillo: { name: 'Amarillo', hex: '#f2c94c' },
  coral: { name: 'Coral', hex: '#f08a7e' },
  esmeralda: { name: 'Esmeralda', hex: '#0f766e' },
  caramelo: { name: 'Caramelo', hex: '#b7773e' },
  dorado: { name: 'Dorado', hex: '#d4a72c' },
  plateado: { name: 'Plateado', hex: '#b8bec8' },
} satisfies Record<string, ProductColor>

const CLOTHES: Size[] = ['S', 'M', 'L', 'XL']
const ONE: Size[] = ['Única']

/** high = bien surtido, low = 1 o 2 unidades en total, out = agotado. */
type StockLevel = 'high' | 'low' | 'out'

const seeds: Array<Omit<Product, 'variants'> & { level: StockLevel }> = [
  { id: 'p01', name: 'Blusa de lino manga corta', category: 'Blusas', kind: 'top', price: 14900, colors: [c.blanco, c.beige, c.oliva], sizes: CLOTHES, level: 'high' },
  { id: 'p02', name: 'Blusa satinada cuello V', category: 'Blusas', kind: 'top', price: 17500, colors: [c.champana, c.negro, c.vino], sizes: CLOTHES, level: 'high' },
  { id: 'p03', name: 'Crop top acanalado', category: 'Blusas', kind: 'top', price: 9900, colors: [c.blanco, c.negro, c.rosaPalo], sizes: ['S', 'M', 'L'], level: 'out' },
  { id: 'p04', name: 'Camisa oversize a rayas', category: 'Blusas', kind: 'top', price: 16900, colors: [c.celeste, c.blanco], sizes: CLOTHES, level: 'high' },
  { id: 'p05', name: 'Blusa con volantes', category: 'Blusas', kind: 'top', price: 15500, colors: [c.terracota, c.crema], sizes: CLOTHES, level: 'low' },
  { id: 'p06', name: 'Jean mom fit', category: 'Jeans', kind: 'pants', price: 24900, colors: [c.azulClaro, c.azulMedio], sizes: CLOTHES, level: 'high' },
  { id: 'p07', name: 'Jean skinny tiro alto', category: 'Jeans', kind: 'pants', price: 22900, colors: [c.azulOscuro, c.negro], sizes: CLOTHES, level: 'high' },
  { id: 'p08', name: 'Jean wide leg', category: 'Jeans', kind: 'pants', price: 26900, colors: [c.azulMedio, c.crudo], sizes: CLOTHES, level: 'low' },
  { id: 'p09', name: 'Short de mezclilla', category: 'Jeans', kind: 'shorts', price: 15900, colors: [c.azulClaro, c.blanco], sizes: CLOTHES, level: 'high' },
  { id: 'p10', name: 'Vestido midi floral', category: 'Vestidos', kind: 'dress', price: 29900, colors: [c.marino, c.salvia], sizes: CLOTHES, level: 'high' },
  { id: 'p11', name: 'Vestido camisero de lino', category: 'Vestidos', kind: 'dress', price: 32500, colors: [c.beige, c.blanco], sizes: CLOTHES, level: 'high' },
  { id: 'p12', name: 'Vestido negro de cóctel', category: 'Vestidos', kind: 'dress', price: 38900, colors: [c.negro], sizes: CLOTHES, level: 'low' },
  { id: 'p13', name: 'Vestido playero de tirantes', category: 'Vestidos', kind: 'dress', price: 21900, colors: [c.amarillo, c.coral], sizes: CLOTHES, level: 'high' },
  { id: 'p14', name: 'Enagua plisada midi', category: 'Enaguas', kind: 'skirt', price: 19900, colors: [c.esmeralda, c.negro, c.rosaPalo], sizes: CLOTHES, level: 'high' },
  { id: 'p15', name: 'Enagua de mezclilla corta', category: 'Enaguas', kind: 'skirt', price: 16500, colors: [c.azulMedio], sizes: CLOTHES, level: 'high' },
  { id: 'p16', name: 'Enagua satinada', category: 'Enaguas', kind: 'skirt', price: 21500, colors: [c.champana, c.salvia], sizes: CLOTHES, level: 'out' },
  { id: 'p17', name: 'Bolso tote de cuero sintético', category: 'Accesorios', kind: 'bag', price: 24500, colors: [c.caramelo, c.negro], sizes: ONE, level: 'high' },
  { id: 'p18', name: 'Bolso bandolera mini', category: 'Accesorios', kind: 'bag', price: 18900, colors: [c.blanco, c.vino], sizes: ONE, level: 'high' },
  { id: 'p19', name: 'Collar dorado con dije', category: 'Accesorios', kind: 'necklace', price: 8900, colors: [c.dorado], sizes: ONE, level: 'low' },
  { id: 'p20', name: 'Aretes de argolla', category: 'Accesorios', kind: 'earrings', price: 6500, colors: [c.dorado, c.plateado], sizes: ONE, level: 'high' },
]

function buildVariants(seed: (typeof seeds)[number]): Variant[] {
  const rng = createRng(`stock-${seed.id}`)
  const variants = seed.colors.flatMap((color) => seed.sizes.map((size) => ({ color: color.name, size, stock: 0 })))
  if (seed.level === 'high') {
    // Las tallas de los extremos suelen tener menos unidades.
    for (const v of variants) v.stock = v.size === 'S' || v.size === 'XL' ? rng.int(0, 3) : rng.int(1, 6)
    if (variants.length === 1 || variants.every((v) => v.size === 'Única')) for (const v of variants) v.stock = rng.int(3, 9)
  } else if (seed.level === 'low') {
    const units = rng.int(1, 2)
    for (let i = 0; i < units; i++) rng.pick(variants).stock += 1
  }
  return variants
}

export const initialProducts: Product[] = seeds.map(({ level, ...seed }) => ({ ...seed, variants: buildVariants({ level, ...seed }) }))

const productById = new Map(initialProducts.map((p) => [p.id, p]))
/** Datos fijos del producto (nombre, precio, colores). El stock vivo está en el estado. */
export const getProductInfo = (id: string): Product => productById.get(id)!

export const colorHex = (product: Product, colorName: string) =>
  product.colors.find((col) => col.name === colorName)?.hex ?? '#e2e8f0'

/** Ventas de las últimas 8 semanas, para reportes. */
export function createBoutiqueSales(today: DateKey): Sale[] {
  const start = addDays(startOfWeek(today), -49)
  const popularity: ReadonlyArray<readonly [string, number]> = initialProducts.map((p) => [
    p.id,
    { Blusas: 5, Jeans: 6, Vestidos: 4, Enaguas: 3, Accesorios: 4 }[p.category] + (p.price < 12000 ? 3 : 0),
  ])
  const methods: ReadonlyArray<readonly [PaymentMethod, number]> = [['sinpe', 5], ['tarjeta', 4], ['efectivo', 2]]
  const sales: Sale[] = []

  for (let date = start; diffDays(date, today) >= 0; date = addDays(date, 1)) {
    const rng = createRng(`ventas-${date}`)
    const weekday = fromDateKey(date).getDay()
    // Más movimiento en quincena (15 y fin de mes) y los sábados.
    const day = fromDateKey(date).getDate()
    const payday = day >= 14 && day <= 17 ? 2 : day >= 28 || day <= 2 ? 2 : 0
    const count = date === today ? 4 : weekday === 0 ? rng.int(1, 3) : weekday === 6 ? rng.int(6, 9) + payday : rng.int(2, 6) + payday

    for (let i = 0; i < count; i++) {
      const items = rng.weighted([[1, 6], [2, 3], [3, 1]] as const)
      const lines: SaleLine[] = []
      for (let j = 0; j < items; j++) {
        const product = getProductInfo(rng.weighted(popularity))
        if (lines.some((l) => l.productId === product.id)) continue
        lines.push({
          productId: product.id,
          color: rng.pick(product.colors).name,
          size: rng.pick(product.sizes),
          qty: product.category === 'Accesorios' && rng.chance(0.25) ? 2 : 1,
          price: product.price,
        })
      }
      sales.push({
        id: `v-${date}-${i}`,
        date,
        minute: 9 * 60 + 30 + Math.floor(((i + rng.next()) * (date === today ? 150 : 540)) / count),
        lines,
        total: lines.reduce((sum, l) => sum + l.qty * l.price, 0),
        method: rng.weighted(methods),
      })
    }
  }
  return sales
}
