import { FilterChips } from '../../components/ui/Chips'
import { categories } from '../../data/boutique'
import type { CategoryFilter } from './useProductFilter'

export function CategoryChips({ value, onChange }: { value: CategoryFilter; onChange: (f: CategoryFilter) => void }) {
  return (
    <FilterChips
      label="Categorías"
      value={value}
      onChange={onChange}
      options={(['Todas', ...categories] as CategoryFilter[]).map((c) => ({ value: c, label: c }))}
    />
  )
}
