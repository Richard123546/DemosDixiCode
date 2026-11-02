import { ChefHat, LayoutGrid } from 'lucide-react'
import { useMemo } from 'react'
import type { SearchItem } from '../../components/layout/CommandPalette'
import { sectionSearchItems } from '../../components/layout/searchItems'
import { sodaDemo } from '../../data/demos'
import { getMenuItem, menu, menuCategories } from '../../data/soda'
import { formatColones } from '../../lib/format'
import { linesTotal, pendingTickets, tableStatus } from './selectors'
import { useSoda } from './sodaStore'
import { tableStatusStyles } from './tableStatusStyles'

/** Pantallas, mesas, comandas y platos del menú para el buscador global. */
export function useSodaSearch(): SearchItem[] {
  const { tables, tickets } = useSoda()
  return useMemo(() => {
    const categoryIcon = new Map(menuCategories.map((c) => [c.id, c.icon]))
    return [
      ...sectionSearchItems(sodaDemo),
      ...tables.map((table) => {
        const status = tableStatus(table, tickets)
        return {
          id: `mesa-${table.id}`,
          group: 'Mesas',
          title: `Mesa ${table.id}`,
          subtitle: `${tableStatusStyles[status].label} · ${table.seats} personas${status === 'libre' ? '' : ` · ${formatColones(linesTotal(table.lines))}`}`,
          icon: LayoutGrid,
          to: `/soda/pedido?mesa=${table.id}`,
        }
      }),
      ...pendingTickets(tickets).map((ticket) => ({
        id: `comanda-${ticket.id}`,
        group: 'Comandas en cocina',
        title: `Comanda #${ticket.number} · Mesa ${ticket.tableId}`,
        subtitle: ticket.lines.map((l) => `${l.qty} ${getMenuItem(l.itemId).name}`).join(', '),
        keywords: `${ticket.number}`,
        icon: ChefHat,
        to: '/soda/cocina',
      })),
      ...menu.map((item) => ({
        id: `plato-${item.id}`,
        group: 'Menú',
        title: item.name,
        subtitle: `${item.category} · ${formatColones(item.price)}`,
        keywords: item.description,
        icon: categoryIcon.get(item.category)!,
        to: `/soda/pedido?categoria=${encodeURIComponent(item.category)}`,
      })),
    ]
  }, [tables, tickets])
}
