import { Minus, Plus, SearchX, ShoppingBag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChargeSheet } from '../../components/payment/ChargeSheet'
import { useReceipt } from '../../components/share/receiptContext'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { SearchInput } from '../../components/ui/Field'
import { MobileActionBar } from '../../components/ui/MobileActionBar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Sheet } from '../../components/ui/Sheet'
import { useToast } from '../../components/ui/toastContext'
import { colorHex, LOW_STOCK, type Product, type ProductCategory, type Size } from '../../data/boutique'
import { paymentMethods, type PaymentMethod } from '../../data/payments'
import { cn } from '../../lib/cn'
import { formatColones } from '../../lib/format'
import { useBoutique, type CartLine } from './boutiqueStore'
import { CategoryChips } from './CategoryChips'
import { ColorSwatch, ProductArt } from './ProductArt'
import { cartKey, totalStock, variantStock } from './selectors'
import { saleReceipt } from './share'
import { useProductFilter } from './useProductFilter'

export default function VenderPage() {
  const { products, cart, checkout } = useBoutique()
  const toast = useToast()
  const showReceipt = useReceipt()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(() => params.get('q') ?? '')
  const [category, setCategory] = useState<ProductCategory | 'Todas'>('Todas')
  const [picking, setPicking] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [chargeOpen, setChargeOpen] = useState(false)

  const filtered = useProductFilter(products, query, category)
  const total = cart.reduce((sum, l) => sum + l.qty * products.find((p) => p.id === l.productId)!.price, 0)
  const units = cart.reduce((sum, l) => sum + l.qty, 0)

  const charge = (method: PaymentMethod) => {
    const lowAfter = products.filter((p) => {
      const sold = cart.filter((l) => l.productId === p.id).reduce((sum, l) => sum + l.qty, 0)
      return sold > 0 && totalStock(p) - sold <= LOW_STOCK
    })
    const sale = checkout(method)
    if (!sale) return
    toast(
      'Venta registrada ✓',
      `${formatColones(sale.total)} · ${paymentMethods[method]}${lowAfter.length ? ` · Poco stock: ${lowAfter.map((p) => p.name).join(', ')}` : ''}`,
    )
    setChargeOpen(false)
    setCartOpen(false)
    showReceipt(saleReceipt(sale))
  }

  const openCharge = () => {
    setCartOpen(false)
    setChargeOpen(true)
  }

  return (
    <>
      <PageHeader title="Vender" description="Buscá el producto, elegí talla y color, y cobrá." />

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start xl:gap-6">
        <div className="min-w-0">
          <div className="mb-4 space-y-3">
            <SearchInput
              placeholder="Buscar producto o color…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar producto"
            />
            <CategoryChips value={category} onChange={setCategory} />
          </div>

          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={SearchX}
                title="Sin resultados"
                description={`No encontramos productos con “${query}”.`}
                action={
                  <Button variant="secondary" onClick={() => setQuery('')}>
                    Limpiar búsqueda
                  </Button>
                }
              />
            </Card>
          ) : (
            <div
              key={`${category}-${query}`}
              className="grid animate-fade-in grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-3 2xl:grid-cols-4"
            >
              {filtered.map((product) => {
                const stock = totalStock(product)
                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={stock === 0}
                    onClick={() => setPicking(product)}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-surface text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-raised active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                  >
                    <div className="relative">
                      <ProductArt kind={product.kind} hex={product.colors[0].hex} className="aspect-square w-full" />
                      <span className="absolute right-2 bottom-2 flex gap-1 rounded-full bg-surface/90 px-1.5 py-1 shadow-card">
                        {product.colors.map((c) => (
                          <ColorSwatch key={c.name} hex={c.hex} className="size-3" />
                        ))}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-2 min-h-10 text-sm leading-5 font-medium text-slate-900">{product.name}</p>
                      <p className="mt-1 flex items-baseline justify-between gap-1">
                        <span className="font-bold text-slate-900 tabular-nums">{formatColones(product.price)}</span>
                        <span
                          className={cn(
                            'text-xs whitespace-nowrap',
                            stock === 0 ? 'text-slate-500' : stock <= LOW_STOCK ? 'font-semibold text-red-600' : 'text-slate-400',
                          )}
                        >
                          {stock === 0 ? 'Agotado' : `${stock} disp.`}
                        </span>
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <Card className="sticky top-24 hidden p-5 xl:block">
          <h2 className="mb-2 font-semibold text-slate-900">Carrito</h2>
          <CartPanel total={total} units={units} onCharge={openCharge} />
        </Card>
      </div>

      <MobileActionBar>
        <span className="relative grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
          <ShoppingBag className="size-5" />
          {units > 0 && (
            <span
              key={units}
              className="absolute -top-1.5 -right-1.5 grid size-5 animate-pop-in place-items-center rounded-full bg-accent text-[11px] font-bold text-white"
            >
              {units}
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500">{units ? `${units} artículos` : 'Carrito vacío'}</p>
          <p key={total} className="animate-fade-in text-xl font-bold text-slate-900 tabular-nums">
            {formatColones(total)}
          </p>
        </div>
        <Button variant="accent" size="lg" disabled={units === 0} onClick={() => setCartOpen(true)}>
          Ver carrito
        </Button>
      </MobileActionBar>

      <Sheet open={cartOpen} onClose={() => setCartOpen(false)} title="Carrito" description={`${units} artículos`}>
        <CartPanel total={total} units={units} onCharge={openCharge} />
      </Sheet>

      <VariantSheet product={picking} onClose={() => setPicking(null)} />

      <ChargeSheet
        open={chargeOpen}
        title="Cobrar venta"
        description={`${units} artículos`}
        total={total}
        sinpeNote={
          <>
            SINPE Móvil al <span className="font-medium text-slate-700">8309-1177</span> a nombre de Boutique Amara.
          </>
        }
        onClose={() => setChargeOpen(false)}
        onConfirm={charge}
      />
    </>
  )
}

function CartPanel({ total, units, onCharge }: { total: number; units: number; onCharge: () => void }) {
  const { cart, products, setCartQty, removeFromCart } = useBoutique()

  if (cart.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Carrito vacío"
        description="Tocá un producto para elegir talla y color."
        className="py-10"
      />
    )
  }

  return (
    <div>
      <ul className="divide-y divide-slate-100">
        {cart.map((line) => {
          const product = products.find((p) => p.id === line.productId)!
          const key = cartKey(line.productId, line.color, line.size)
          const max = variantStock(product, line.color, line.size)
          return (
            <li key={key} className="flex animate-fade-in gap-3 py-3">
              <ProductArt kind={product.kind} hex={colorHex(product, line.color)} className="size-14 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
                <p className="text-xs text-slate-500">
                  {line.color} · {line.size === 'Única' ? 'Talla única' : `Talla ${line.size}`}
                </p>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 rounded-full ring-1 ring-slate-200">
                    <button
                      type="button"
                      aria-label="Quitar uno"
                      onClick={() => setCartQty(key, line.qty - 1)}
                      className="grid size-7 place-items-center rounded-full text-slate-600 hover:bg-slate-100"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold tabular-nums">{line.qty}</span>
                    <button
                      type="button"
                      aria-label="Agregar uno"
                      disabled={line.qty >= max}
                      onClick={() => setCartQty(key, line.qty + 1)}
                      className="grid size-7 place-items-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 tabular-nums">
                    {formatColones(line.qty * product.price)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label={`Eliminar ${product.name}`}
                onClick={() => removeFromCart(key)}
                className="grid size-8 shrink-0 place-items-center self-start rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          )
        })}
      </ul>
      <div className="mt-2 flex items-end justify-between border-t border-slate-200 pt-4">
        <p className="text-sm text-slate-500">
          {units} artículos
          <span className="block">IVA incluido</span>
        </p>
        <p key={total} className="animate-fade-in text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
          {formatColones(total)}
        </p>
      </div>
      <Button variant="accent" size="lg" className="mt-4 w-full" onClick={onCharge}>
        Cobrar {formatColones(total)}
      </Button>
    </div>
  )
}

function VariantSheet({ product, onClose }: { product: Product | null; onClose: () => void }) {
  if (!product) return null
  return <VariantPicker key={product.id} product={product} onClose={onClose} />
}

function VariantPicker({ product, onClose }: { product: Product; onClose: () => void }) {
  const { cart, addToCart } = useBoutique()
  const toast = useToast()

  const inCart = (color: string, size: Size) =>
    cart.find((l) => cartKey(l.productId, l.color, l.size) === cartKey(product.id, color, size))?.qty ?? 0
  const available = (color: string, size: Size) => variantStock(product, color, size) - inCart(color, size)

  const firstColor = product.colors.find((c) => product.sizes.some((s) => available(c.name, s) > 0)) ?? product.colors[0]
  const [color, setColor] = useState(firstColor.name)
  const [size, setSize] = useState<Size | null>(() => product.sizes.find((s) => available(firstColor.name, s) > 0) ?? null)
  const [qty, setQty] = useState(1)

  const max = size ? available(color, size) : 0

  const pickColor = (name: string) => {
    setColor(name)
    setQty(1)
    if (!size || available(name, size) <= 0) setSize(product.sizes.find((s) => available(name, s) > 0) ?? null)
  }

  const add = () => {
    if (!size) return
    const line: CartLine = { productId: product.id, color, size, qty }
    addToCart(line)
    toast('Agregado al carrito ✓', `${qty} × ${product.name} · ${color}${size === 'Única' ? '' : ` · ${size}`}`)
    onClose()
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={product.name}
      description={formatColones(product.price)}
      footer={
        <Button variant="accent" size="lg" className="w-full" disabled={!size || max <= 0} onClick={add}>
          <ShoppingBag className="size-5" />
          Agregar {qty > 1 ? `${qty} ` : ''}al carrito · {formatColones(product.price * qty)}
        </Button>
      }
    >
      <ProductArt kind={product.kind} hex={colorHex(product, color)} className="aspect-[16/9] w-full rounded-2xl" />

      <p className="mt-5 mb-2 text-sm font-medium text-slate-700">
        Color: <span className="text-slate-900">{color}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {product.colors.map((c) => {
          const any = product.sizes.some((s) => available(c.name, s) > 0)
          return (
            <button
              key={c.name}
              type="button"
              aria-pressed={c.name === color}
              disabled={!any}
              onClick={() => pickColor(c.name)}
              className={cn(
                'flex h-10 items-center gap-2 rounded-full border pr-3.5 pl-2 text-sm font-medium transition-all disabled:opacity-40',
                c.name === color
                  ? 'border-accent bg-accent-soft text-accent-ink ring-2 ring-accent/20'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300',
              )}
            >
              <ColorSwatch hex={c.hex} className="size-5" />
              {c.name}
            </button>
          )
        })}
      </div>

      <p className="mt-5 mb-2 text-sm font-medium text-slate-700">Talla</p>
      <div className="grid grid-cols-4 gap-2">
        {product.sizes.map((s) => {
          const left = available(color, s)
          return (
            <button
              key={s}
              type="button"
              aria-pressed={s === size}
              disabled={left <= 0}
              onClick={() => {
                setSize(s)
                setQty(1)
              }}
              className={cn(
                'flex flex-col items-center rounded-xl border py-2 transition-all disabled:bg-slate-50 disabled:text-slate-300',
                product.sizes.length === 1 && 'col-span-2',
                s === size
                  ? 'border-accent bg-accent-soft text-accent-ink ring-2 ring-accent/20'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300',
              )}
            >
              <span className="text-base font-semibold">{s}</span>
              <span className={cn('text-[11px]', left === 1 ? 'font-semibold text-amber-700' : 'text-slate-400')}>
                {left <= 0 ? 'Agotada' : left === 1 ? 'Última' : `${left} disp.`}
              </span>
            </button>
          )
        })}
      </div>

      {size && max > 0 && (
        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">Cantidad</p>
          <div className="flex items-center gap-1 rounded-full p-1 ring-1 ring-slate-200">
            <button
              type="button"
              aria-label="Menos"
              disabled={qty <= 1}
              onClick={() => setQty((q) => q - 1)}
              className="grid size-9 place-items-center rounded-full text-slate-700 hover:bg-slate-100 disabled:opacity-30"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center font-bold tabular-nums">{qty}</span>
            <button
              type="button"
              aria-label="Más"
              disabled={qty >= max}
              onClick={() => setQty((q) => q + 1)}
              className="grid size-9 place-items-center rounded-full bg-accent text-white hover:bg-accent-strong disabled:opacity-30"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
