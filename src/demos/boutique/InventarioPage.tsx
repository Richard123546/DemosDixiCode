import { CircleAlert, LayoutGrid, SearchX, Table2 } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { SearchInput } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { LOW_STOCK, type Product, type Size } from '../../data/boutique'
import { cn } from '../../lib/cn'
import { formatColones } from '../../lib/format'
import { useBoutique } from './boutiqueStore'
import { CategoryChips } from './CategoryChips'
import { ColorSwatch, ProductArt } from './ProductArt'
import { stockStatus, totalStock, variantStock } from './selectors'
import { StockBadge } from './StockBadge'
import { useProductFilter, type CategoryFilter } from './useProductFilter'

const CLOTHING_SIZES: Size[] = ['S', 'M', 'L', 'XL']

export default function InventarioPage() {
  const { products } = useBoutique()
  const [params] = useSearchParams()
  // ?q=… llega desde el buscador global.
  const [query, setQuery] = useState(() => params.get('q') ?? '')
  const [category, setCategory] = useState<CategoryFilter>('Todas')
  const [onlyAlerts, setOnlyAlerts] = useState(false)
  const [view, setView] = useState<'tarjetas' | 'tabla'>('tarjetas')

  const filtered = useProductFilter(products, query, category, onlyAlerts)
  const units = products.reduce((sum, p) => sum + totalStock(p), 0)
  const alerts = products.filter((p) => stockStatus(p) !== 'ok').length

  return (
    <>
      <PageHeader
        title="Inventario"
        description={`${products.length} productos · ${units} unidades en tienda`}
        actions={
          <div className="hidden rounded-xl border border-slate-200 bg-surface p-1 shadow-card xl:flex" role="group" aria-label="Vista">
            {(
              [
                ['tarjetas', LayoutGrid, 'Tarjetas'],
                ['tabla', Table2, 'Tabla'],
              ] as const
            ).map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={view === id}
                onClick={() => setView(id)}
                className={cn(
                  'flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors',
                  view === id ? 'bg-accent-soft text-accent-ink' : 'text-slate-500 hover:text-slate-800',
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-5 space-y-3">
        <div className="flex gap-2">
          <SearchInput
            placeholder="Buscar por nombre, categoría o color"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar producto"
            className="min-w-0 flex-1 md:max-w-sm"
          />
          <button
            type="button"
            aria-pressed={onlyAlerts}
            onClick={() => setOnlyAlerts((v) => !v)}
            className={cn(
              'flex h-12 shrink-0 items-center gap-1.5 rounded-xl border px-3.5 text-sm font-medium shadow-card transition-colors',
              onlyAlerts ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-surface text-slate-600',
            )}
          >
            <CircleAlert className="size-4" />
            <span className="max-sm:sr-only">Con alertas</span>
            <span className="tabular-nums">({alerts})</span>
          </button>
        </div>
        <CategoryChips value={category} onChange={setCategory} />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={SearchX}
            title="No hay productos con esos filtros"
            description="Probá con otra categoría o buscá por otro nombre."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery('')
                  setCategory('Todas')
                  setOnlyAlerts(false)
                }}
              >
                Quitar filtros
              </Button>
            }
          />
        </Card>
      ) : view === 'tabla' ? (
        <>
          <InventoryTable products={filtered} className="hidden xl:block" />
          <ProductGrid products={filtered} className="xl:hidden" />
        </>
      ) : (
        <ProductGrid products={filtered} />
      )}
    </>
  )
}

function ProductGrid({ products, className }: { products: Product[]; className?: string }) {
  return (
    <div
      key={products.map((p) => p.id).join()}
      className={cn('grid animate-fade-in gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 xl:gap-5 2xl:grid-cols-5', className)}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const [color, setColor] = useState(product.colors[0])
  const status = stockStatus(product)
  const total = totalStock(product)

  return (
    <Card className="flex overflow-hidden transition-shadow hover:shadow-raised md:flex-col">
      <div className="relative w-28 shrink-0 md:w-full">
        <ProductArt kind={product.kind} hex={color.hex} className="h-full min-h-32 md:aspect-[4/3] md:h-auto" />
        <StockBadge status={status} className="absolute top-2 left-2 shadow-card" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-3 md:p-4">
        <p className="text-xs font-medium text-slate-400">{product.category}</p>
        <h3 className="truncate font-semibold text-slate-900" title={product.name}>
          {product.name}
        </h3>
        <div className="mt-0.5 flex items-baseline justify-between gap-2">
          <span className="font-bold text-slate-900 tabular-nums">{formatColones(product.price)}</span>
          <span className={cn('text-xs tabular-nums', total <= LOW_STOCK ? 'font-semibold text-red-600' : 'text-slate-500')}>
            {total} en stock
          </span>
        </div>

        <table className="mt-3 w-full text-center text-xs tabular-nums">
          <thead>
            <tr className="text-slate-400">
              <th className="w-6 pb-1 text-left font-medium">
                <span className="sr-only">Color</span>
              </th>
              {product.sizes.map((size) => (
                <th key={size} className="pb-1 font-medium">
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {product.colors.map((col) => (
              <tr
                key={col.name}
                onClick={() => setColor(col)}
                className={cn(
                  'cursor-pointer transition-colors',
                  col.name === color.name ? 'bg-accent-soft/70' : 'hover:bg-slate-50',
                )}
                title={col.name}
              >
                <td className="rounded-l-md py-1 pl-1 text-left">
                  <ColorSwatch hex={col.hex} className="size-3.5" />
                </td>
                {product.sizes.map((size, i) => {
                  const stock = variantStock(product, col.name, size)
                  return (
                    <td
                      key={size}
                      className={cn(
                        'py-1',
                        i === product.sizes.length - 1 && 'rounded-r-md',
                        stock === 0 ? 'text-slate-300' : 'text-slate-700',
                      )}
                    >
                      {stock === 0 ? '–' : stock}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1.5 truncate text-xs text-slate-500">{color.name}</p>
      </div>
    </Card>
  )
}

function InventoryTable({ products, className }: { products: Product[]; className?: string }) {
  return (
    <Card className={cn('w-full overflow-hidden', className)}>
      <table className="w-full animate-fade-in text-sm">
        <thead className="border-b border-slate-200/80 bg-slate-50/80 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase">
          <tr>
            <th className="px-5 py-3">Producto</th>
            <th className="px-3 py-3 text-right">Precio</th>
            <th className="px-3 py-3">Colores</th>
            {CLOTHING_SIZES.map((s) => (
              <th key={s} className="w-12 px-2 py-3 text-center">
                {s}
              </th>
            ))}
            <th className="px-3 py-3 text-right">Total</th>
            <th className="px-5 py-3">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => {
            const status = stockStatus(product)
            const total = totalStock(product)
            const oneSize = product.sizes[0] === 'Única'
            return (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-5 py-2.5">
                  <span className="flex items-center gap-3">
                    <ProductArt kind={product.kind} hex={product.colors[0].hex} className="size-11 shrink-0 rounded-lg" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-slate-900">{product.name}</span>
                      <span className="block text-xs text-slate-500">{product.category}</span>
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap text-slate-900 tabular-nums">
                  {formatColones(product.price)}
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex gap-1">
                    {product.colors.map((c) => (
                      <span key={c.name} title={c.name}>
                        <ColorSwatch hex={c.hex} />
                      </span>
                    ))}
                  </span>
                </td>
                {oneSize ? (
                  <td colSpan={4} className="px-2 py-2.5 text-center text-xs text-slate-400">
                    Talla única
                  </td>
                ) : (
                  CLOTHING_SIZES.map((size) => {
                    const stock = product.variants.filter((v) => v.size === size).reduce((sum, v) => sum + v.stock, 0)
                    return (
                      <td
                        key={size}
                        className={cn(
                          'px-2 py-2.5 text-center tabular-nums',
                          stock === 0 ? 'text-slate-300' : 'text-slate-700',
                        )}
                      >
                        {stock === 0 ? '–' : stock}
                      </td>
                    )
                  })
                )}
                <td className="px-3 py-2.5 text-right font-semibold text-slate-900 tabular-nums">{total}</td>
                <td className="px-5 py-2.5">
                  {status === 'ok' ? <span className="text-xs text-slate-400">Disponible</span> : <StockBadge status={status} />}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}
