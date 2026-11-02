import { Shirt, ShoppingBag } from 'lucide-react'
import { useMemo } from 'react'
import type { SearchItem } from '../../components/layout/CommandPalette'
import { sectionSearchItems } from '../../components/layout/searchItems'
import { boutiqueDemo } from '../../data/demos'
import { formatColones } from '../../lib/format'
import { useBoutique } from './boutiqueStore'
import { stockStatus, totalStock } from './selectors'

/** Pantallas y productos (con su stock) para el buscador global. */
export function useBoutiqueSearch(): SearchItem[] {
  const { products } = useBoutique()
  return useMemo(
    () => [
      ...sectionSearchItems(boutiqueDemo),
      ...products.flatMap((p) => {
        const stock = totalStock(p)
        const status = stockStatus(p)
        const keywords = `${p.category} ${p.colors.map((c) => c.name).join(' ')}`
        const base = { keywords, title: p.name }
        return [
          {
            ...base,
            id: `producto-${p.id}`,
            group: 'Inventario',
            subtitle: `${p.category} · ${formatColones(p.price)} · ${status === 'agotado' ? 'Agotado' : `${stock} en stock`}`,
            icon: Shirt,
            to: `/boutique/inventario?q=${encodeURIComponent(p.name)}`,
          },
          ...(stock > 0
            ? [
                {
                  ...base,
                  id: `vender-${p.id}`,
                  group: 'Vender',
                  title: `Vender ${p.name}`,
                  subtitle: `${formatColones(p.price)} · ${p.colors.map((c) => c.name).join(', ')}`,
                  icon: ShoppingBag,
                  to: `/boutique/vender?q=${encodeURIComponent(p.name)}`,
                },
              ]
            : []),
        ]
      }),
    ],
    [products],
  )
}
