import { CookingPot, CupSoda, EggFried, IceCreamCone, Sandwich, Utensils, type LucideIcon } from 'lucide-react'
import { createRng } from '../lib/random'
import type { PaymentMethod } from './payments'

export type MenuCategory = 'Desayunos' | 'Casados' | 'Platos del día' | 'Antojos' | 'Bebidas' | 'Postres'

export interface MenuItem {
  id: string
  name: string
  category: MenuCategory
  price: number
  description?: string
  popular?: boolean
}

export interface OrderLine {
  itemId: string
  qty: number
  /** Cuántas unidades ya se mandaron a cocina. */
  sent: number
}

export interface Table {
  id: number
  seats: number
  lines: OrderLine[]
  /** Timestamp (ms) de cuándo se sentaron. */
  openedAt: number | null
}

export interface TicketLine {
  itemId: string
  qty: number
}

export interface KitchenTicket {
  id: string
  number: number
  tableId: number
  lines: TicketLine[]
  createdAt: number
  readyAt?: number
}

export interface Sale {
  id: string
  tableId: number
  lines: Array<TicketLine & { price: number }>
  total: number
  method: PaymentMethod
  paidAt: number
}

export const menuCategories: Array<{ id: MenuCategory; icon: LucideIcon }> = [
  { id: 'Desayunos', icon: EggFried },
  { id: 'Casados', icon: Utensils },
  { id: 'Platos del día', icon: CookingPot },
  { id: 'Antojos', icon: Sandwich },
  { id: 'Bebidas', icon: CupSoda },
  { id: 'Postres', icon: IceCreamCone },
]

export const menu: MenuItem[] = [
  { id: 'pinto-huevo', name: 'Gallo pinto con huevo', category: 'Desayunos', price: 2500, description: 'Huevo frito o picado y tortilla.' },
  { id: 'pinto-completo', name: 'Gallo pinto completo', category: 'Desayunos', price: 3500, description: 'Huevo, natilla, plátano maduro, queso frito y tortilla.', popular: true },
  { id: 'pinto-bistec', name: 'Pinto con bistec encebollado', category: 'Desayunos', price: 4300, description: 'Bistec de res, huevo y tortilla.' },
  { id: 'tortilla-queso', name: 'Tortilla con queso', category: 'Desayunos', price: 1800, description: 'Tortilla palmeada con queso Turrialba.' },
  { id: 'casado-pollo', name: 'Casado con pollo', category: 'Casados', price: 3800, description: 'Arroz, frijoles, ensalada, maduro y picadillo.', popular: true },
  { id: 'casado-res', name: 'Casado con bistec', category: 'Casados', price: 4200, description: 'Bistec de res en salsa con todos los acompañamientos.' },
  { id: 'casado-cerdo', name: 'Casado con chuleta', category: 'Casados', price: 4000, description: 'Chuleta de cerdo a la plancha.' },
  { id: 'casado-pescado', name: 'Casado con pescado', category: 'Casados', price: 4500, description: 'Filete de tilapia empanizado.' },
  { id: 'casado-vegetariano', name: 'Casado vegetariano', category: 'Casados', price: 3500, description: 'Con huevo, queso frito y doble picadillo.' },
  { id: 'arroz-pollo', name: 'Arroz con pollo', category: 'Platos del día', price: 3500, description: 'Con papas tostadas y ensalada rusa.', popular: true },
  { id: 'chifrijo', name: 'Chifrijo', category: 'Platos del día', price: 3800, description: 'Arroz, frijoles, chicharrón, pico de gallo y aguacate.' },
  { id: 'sopa-negra', name: 'Sopa negra', category: 'Platos del día', price: 2800, description: 'Con huevo duro y arroz aparte.' },
  { id: 'olla-carne', name: 'Olla de carne', category: 'Platos del día', price: 4800, description: 'Con yuca, chayote, elote y arroz.' },
  { id: 'empanada-queso', name: 'Empanada de queso', category: 'Antojos', price: 1200 },
  { id: 'empanada-papa', name: 'Empanada de papa con chorizo', category: 'Antojos', price: 1300 },
  { id: 'patacones', name: 'Patacones con frijolitos', category: 'Antojos', price: 2500, description: 'Con pico de gallo.' },
  { id: 'tamal', name: 'Tamal de cerdo', category: 'Antojos', price: 1800 },
  { id: 'fresco', name: 'Fresco natural', category: 'Bebidas', price: 1200, description: 'Cas, mora, piña, tamarindo o maracuyá.', popular: true },
  { id: 'cafe', name: 'Café chorreado', category: 'Bebidas', price: 1000 },
  { id: 'agua-dulce', name: 'Agua dulce', category: 'Bebidas', price: 900, description: 'Caliente o fría, con leche si gusta.' },
  { id: 'batido', name: 'Batido en leche', category: 'Bebidas', price: 1800, description: 'Fresa, banano o mora.' },
  { id: 'gaseosa', name: 'Refresco gaseoso', category: 'Bebidas', price: 1200 },
  { id: 'agua', name: 'Agua embotellada', category: 'Bebidas', price: 800 },
  { id: 'arroz-leche', name: 'Arroz con leche', category: 'Postres', price: 1200 },
  { id: 'tres-leches', name: 'Tres leches', category: 'Postres', price: 1800, popular: true },
  { id: 'flan-coco', name: 'Flan de coco', category: 'Postres', price: 1500 },
  { id: 'pudin', name: 'Pudín de pan', category: 'Postres', price: 1200 },
]

const itemById = new Map(menu.map((item) => [item.id, item]))
export const getMenuItem = (id: string): MenuItem => itemById.get(id)!

const MIN = 60_000

export interface SodaMockData {
  tables: Table[]
  tickets: KitchenTicket[]
  sales: Sale[]
  /** Ventas de ayer hasta esta misma hora, para comparar. */
  yesterdaySales: Sale[]
  nextTicketNumber: number
}

/** Estado de media jornada: algunas mesas comiendo, cocina con pedidos y ventas desde temprano. */
export function createSodaMockData(now: number): SodaMockData {
  const sent = (itemId: string, qty: number): OrderLine => ({ itemId, qty, sent: qty })
  const tables: Table[] = [
    { id: 1, seats: 4, openedAt: now - 12 * MIN, lines: [sent('casado-pollo', 2), sent('fresco', 2)] },
    { id: 2, seats: 2, openedAt: null, lines: [] },
    { id: 3, seats: 4, openedAt: now - 38 * MIN, lines: [sent('pinto-completo', 1), sent('cafe', 2), sent('empanada-queso', 1)] },
    { id: 4, seats: 6, openedAt: now - 21 * MIN, lines: [sent('chifrijo', 1), sent('casado-res', 1), sent('gaseosa', 2)] },
    { id: 5, seats: 2, openedAt: null, lines: [] },
    { id: 6, seats: 4, openedAt: now - 2 * MIN, lines: [{ itemId: 'arroz-pollo', qty: 1, sent: 0 }, { itemId: 'sopa-negra', qty: 1, sent: 0 }] },
    { id: 7, seats: 4, openedAt: null, lines: [] },
    { id: 8, seats: 8, openedAt: now - 19 * MIN, lines: [sent('fresco', 2), sent('batido', 1), sent('casado-pescado', 2), sent('casado-vegetariano', 1)] },
  ]

  const tickets: KitchenTicket[] = [
    { id: 't-37', number: 37, tableId: 3, createdAt: now - 35 * MIN, readyAt: now - 24 * MIN, lines: [{ itemId: 'pinto-completo', qty: 1 }, { itemId: 'cafe', qty: 2 }, { itemId: 'empanada-queso', qty: 1 }] },
    { id: 't-38', number: 38, tableId: 8, createdAt: now - 17 * MIN, readyAt: now - 13 * MIN, lines: [{ itemId: 'fresco', qty: 2 }, { itemId: 'batido', qty: 1 }] },
    { id: 't-39', number: 39, tableId: 4, createdAt: now - 18 * MIN, lines: [{ itemId: 'chifrijo', qty: 1 }, { itemId: 'casado-res', qty: 1 }, { itemId: 'gaseosa', qty: 2 }] },
    { id: 't-40', number: 40, tableId: 1, createdAt: now - 9 * MIN, lines: [{ itemId: 'casado-pollo', qty: 2 }, { itemId: 'fresco', qty: 2 }] },
    { id: 't-41', number: 41, tableId: 8, createdAt: now - 4 * MIN, lines: [{ itemId: 'casado-pescado', qty: 2 }, { itemId: 'casado-vegetariano', qty: 1 }] },
  ]

  return {
    tables,
    tickets,
    sales: mockSales(now, 's'),
    yesterdaySales: mockSales(now - 24 * 60 * MIN, 'ayer'),
    nextTicketNumber: 42,
  }
}

/** Cuentas cobradas en las 6 horas anteriores a `now`: desayunos temprano y almuerzos después. */
function mockSales(now: number, idPrefix: string): Sale[] {
  const rng = createRng(`soda-${new Date(now).toDateString()}`)
  const breakfast = ['pinto-huevo', 'pinto-completo', 'pinto-completo', 'pinto-bistec', 'tortilla-queso', 'empanada-queso', 'empanada-papa']
  const lunch = ['casado-pollo', 'casado-pollo', 'casado-res', 'casado-cerdo', 'casado-pescado', 'casado-vegetariano', 'arroz-pollo', 'arroz-pollo', 'chifrijo', 'sopa-negra', 'olla-carne', 'patacones']
  const drinks = ['fresco', 'fresco', 'fresco', 'cafe', 'cafe', 'agua-dulce', 'batido', 'gaseosa', 'agua']
  const desserts = ['arroz-leche', 'tres-leches', 'tres-leches', 'flan-coco', 'pudin']
  const methods: ReadonlyArray<readonly [PaymentMethod, number]> = [['efectivo', 4], ['sinpe', 4], ['tarjeta', 2]]

  const count = 26
  return Array.from({ length: count }, (_, i) => {
    const paidAt = now - (6 * 60 - i * (5.6 * 60) / count + rng.int(-6, 6)) * MIN
    const isMorning = i < count * 0.4
    const people = rng.weighted([[1, 3], [2, 4], [3, 2], [4, 1]] as const)
    const lines = new Map<string, number>()
    const add = (id: string, qty = 1) => lines.set(id, (lines.get(id) ?? 0) + qty)
    for (let p = 0; p < people; p++) {
      add(rng.pick(isMorning ? breakfast : lunch))
      if (rng.chance(0.8)) add(rng.pick(isMorning ? ['cafe', 'cafe', 'agua-dulce', 'fresco'] : drinks))
      if (!isMorning && rng.chance(0.2)) add(rng.pick(desserts))
    }
    const saleLines = [...lines].map(([itemId, qty]) => ({ itemId, qty, price: getMenuItem(itemId).price }))
    return {
      id: `${idPrefix}-${i}`,
      tableId: rng.int(1, 8),
      lines: saleLines,
      total: saleLines.reduce((sum, l) => sum + l.qty * l.price, 0),
      method: rng.weighted(methods),
      paidAt,
    }
  })
}
