import { getMenuItem, type KitchenTicket, type OrderLine, type Sale, type Table } from '../../data/soda'

export type TableStatus = 'libre' | 'ocupada' | 'por-cobrar'

export const linesTotal = (lines: OrderLine[]) =>
  lines.reduce((sum, l) => sum + l.qty * getMenuItem(l.itemId).price, 0)

export const linesCount = (lines: Array<{ qty: number }>) => lines.reduce((sum, l) => sum + l.qty, 0)

export const unsentCount = (table: Table) => table.lines.reduce((sum, l) => sum + l.qty - l.sent, 0)

export const pendingTickets = (tickets: KitchenTicket[], tableId?: number) =>
  tickets.filter((t) => !t.readyAt && (tableId === undefined || t.tableId === tableId))

/** Libre sin platos; por cobrar cuando todo salió de cocina; si no, ocupada. */
export function tableStatus(table: Table, tickets: KitchenTicket[]): TableStatus {
  if (table.lines.length === 0) return 'libre'
  if (unsentCount(table) > 0 || pendingTickets(tickets, table.id).length > 0) return 'ocupada'
  return 'por-cobrar'
}

export interface TopItem {
  itemId: string
  qty: number
  revenue: number
}

/** Platos más vendidos (sin contar bebidas). */
export function topDishes(sales: Sale[], limit = 5): TopItem[] {
  const totals = new Map<string, TopItem>()
  for (const sale of sales) {
    for (const line of sale.lines) {
      if (getMenuItem(line.itemId).category === 'Bebidas') continue
      const current = totals.get(line.itemId) ?? { itemId: line.itemId, qty: 0, revenue: 0 }
      current.qty += line.qty
      current.revenue += line.qty * line.price
      totals.set(line.itemId, current)
    }
  }
  return [...totals.values()].sort((a, b) => b.qty - a.qty || b.revenue - a.revenue).slice(0, limit)
}
