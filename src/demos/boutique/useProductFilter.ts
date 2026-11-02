import { useMemo } from 'react'
import type { Product, ProductCategory } from '../../data/boutique'
import { normalize } from '../../lib/text'
import { stockStatus } from './selectors'

export type CategoryFilter = ProductCategory | 'Todas'

export function useProductFilter(products: Product[], query: string, category: CategoryFilter, onlyAlerts = false) {
  return useMemo(() => {
    const q = normalize(query.trim())
    return products.filter(
      (p) =>
        (category === 'Todas' || p.category === category) &&
        (!onlyAlerts || stockStatus(p) !== 'ok') &&
        (!q || normalize(`${p.name} ${p.category} ${p.colors.map((c) => c.name).join(' ')}`).includes(q)),
    )
  }, [products, query, category, onlyAlerts])
}
