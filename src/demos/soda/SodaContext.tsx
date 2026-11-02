import { useState, type ReactNode } from 'react'
import type { PaymentMethod } from '../../data/payments'
import { createSodaMockData, getMenuItem, type KitchenTicket, type Sale, type Table } from '../../data/soda'
import { SodaContext, type SodaContextValue } from './sodaStore'

export function SodaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => createSodaMockData(Date.now()))

  const updateTable = (tableId: number, update: (table: Table) => Table) =>
    setState((prev) => ({ ...prev, tables: prev.tables.map((t) => (t.id === tableId ? update(t) : t)) }))

  const addItem = (tableId: number, itemId: string) =>
    updateTable(tableId, (table) => {
      const exists = table.lines.some((l) => l.itemId === itemId)
      return {
        ...table,
        openedAt: table.openedAt ?? Date.now(),
        lines: exists
          ? table.lines.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l))
          : [...table.lines, { itemId, qty: 1, sent: 0 }],
      }
    })

  // Lo que ya se mandó a cocina no se puede quitar.
  const removeItem = (tableId: number, itemId: string) =>
    updateTable(tableId, (table) => {
      const lines = table.lines
        .map((l) => (l.itemId === itemId && l.qty > l.sent ? { ...l, qty: l.qty - 1 } : l))
        .filter((l) => l.qty > 0)
      return { ...table, lines, openedAt: lines.length ? table.openedAt : null }
    })

  const sendToKitchen = (tableId: number): KitchenTicket | null => {
    const table = state.tables.find((t) => t.id === tableId)
    const lines = (table?.lines ?? []).filter((l) => l.qty > l.sent).map((l) => ({ itemId: l.itemId, qty: l.qty - l.sent }))
    if (!lines.length) return null
    const ticket: KitchenTicket = {
      id: `t-${state.nextTicketNumber}`,
      number: state.nextTicketNumber,
      tableId,
      lines,
      createdAt: Date.now(),
    }
    setState((prev) => ({
      ...prev,
      nextTicketNumber: prev.nextTicketNumber + 1,
      tickets: [...prev.tickets, ticket],
      tables: prev.tables.map((t) =>
        t.id === tableId ? { ...t, lines: t.lines.map((l) => ({ ...l, sent: l.qty })) } : t,
      ),
    }))
    return ticket
  }

  const markReady = (ticketId: string) =>
    setState((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) => (t.id === ticketId ? { ...t, readyAt: Date.now() } : t)),
    }))

  const chargeTable = (tableId: number, method: PaymentMethod): Sale | null => {
    const table = state.tables.find((t) => t.id === tableId)
    if (!table?.lines.length) return null
    const lines = table.lines.map((l) => ({ itemId: l.itemId, qty: l.qty, price: getMenuItem(l.itemId).price }))
    const sale: Sale = {
      id: `s-${Date.now()}`,
      tableId,
      lines,
      total: lines.reduce((sum, l) => sum + l.qty * l.price, 0),
      method,
      paidAt: Date.now(),
    }
    setState((prev) => ({
      ...prev,
      sales: [...prev.sales, sale],
      tables: prev.tables.map((t) => (t.id === tableId ? { ...t, lines: [], openedAt: null } : t)),
    }))
    return sale
  }

  const value: SodaContextValue = {
    tables: state.tables,
    tickets: state.tickets,
    sales: state.sales,
    yesterdaySales: state.yesterdaySales,
    addItem,
    removeItem,
    sendToKitchen,
    markReady,
    chargeTable,
  }

  return <SodaContext.Provider value={value}>{children}</SodaContext.Provider>
}
