import { Check, MessageCircle, PackageCheck, Truck } from 'lucide-react'
import { useState } from 'react'
import { WhatsAppSheet } from '../../components/share/WhatsAppSheet'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Sheet } from '../../components/ui/Sheet'
import type { Product, ProductCategory } from '../../data/boutique'
import { startOfMonth, diffDays } from '../../lib/date'
import { formatColones } from '../../lib/format'
import { useBoutique } from './boutiqueStore'
import { ProductArt } from './ProductArt'
import { stockStatus } from './selectors'
import { restockDraft } from './share'
import { StockBadge } from './StockBadge'

const suppliers: Record<ProductCategory, { name: string; place: string }> = {
  Blusas: { name: 'Textiles Amapola', place: 'San José centro' },
  Vestidos: { name: 'Textiles Amapola', place: 'San José centro' },
  Enaguas: { name: 'Confecciones Lucía', place: 'Heredia' },
  Jeans: { name: 'Denim Express', place: 'Alajuela' },
  Accesorios: { name: 'Bisutería La Perla', place: 'Cartago' },
}

/** Sugerencia: 2 por talla en cada color (3 si es talla única). */
const suggested = (product: Product) => product.colors.length * product.sizes.length * (product.sizes[0] === 'Única' ? 3 : 2)

export default function AlertasPage() {
  const { products, sales, today, requested, requestRestock } = useBoutique()
  const [ordering, setOrdering] = useState<Product | null>(null)
  const [messaging, setMessaging] = useState<Product | null>(null)

  const out = products.filter((p) => stockStatus(p) === 'agotado')
  const low = products.filter((p) => stockStatus(p) === 'poco')
  const monthStart = startOfMonth(today)
  const soldThisMonth = (id: string) =>
    sales
      .filter((s) => diffDays(monthStart, s.date) >= 0)
      .flatMap((s) => s.lines)
      .filter((l) => l.productId === id)
      .reduce((sum, l) => sum + l.qty, 0)

  // Primero se revisa el pedido; después se ve el mensaje de WhatsApp que le llega al proveedor.
  const confirm = () => {
    setMessaging(ordering)
    setOrdering(null)
  }

  const renderGroup = (title: string, list: Product[]) =>
    list.length > 0 && (
      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
          {title} <span className="text-slate-400">({list.length})</span>
        </h2>
        <div className="grid gap-3 xl:grid-cols-2 xl:gap-4">
          {list.map((product) => {
            const sent = requested.includes(product.id)
            const remaining = product.variants.filter((v) => v.stock > 0)
            return (
              <Card key={product.id} className="flex animate-fade-in gap-3 p-3 md:gap-4 md:p-4">
                <ProductArt kind={product.kind} hex={product.colors[0].hex} className="size-16 shrink-0 rounded-xl md:size-24" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">
                        {product.category} · {formatColones(product.price)} · {soldThisMonth(product.id)} vendidos este mes
                      </p>
                    </div>
                    <StockBadge status={stockStatus(product)} className="max-md:hidden" />
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600">
                    {remaining.length === 0
                      ? 'Sin unidades en ninguna talla ni color.'
                      : `Queda${remaining.reduce((s, v) => s + v.stock, 0) > 1 ? 'n' : ''}: ${remaining
                          .map((v) => `${v.stock} ${v.color}${v.size === 'Única' ? '' : ` talla ${v.size}`}`)
                          .join(', ')}`}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    <StockBadge status={stockStatus(product)} className="md:hidden" />
                    {sent ? (
                      <span className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-xl bg-accent-soft px-3.5 text-sm font-medium whitespace-nowrap text-accent-ink">
                        <Check className="size-4" />
                        Pedido enviado
                      </span>
                    ) : (
                      <Button variant="secondary" className="ml-auto whitespace-nowrap max-md:w-full" onClick={() => setOrdering(product)}>
                        <Truck className="size-4" />
                        Pedir a proveedor
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </section>
    )

  return (
    <>
      <PageHeader
        title="Alertas"
        description={
          out.length + low.length
            ? `${out.length + low.length} productos necesitan reposición`
            : 'Productos agotados o con 2 unidades o menos.'
        }
      />

      {out.length + low.length === 0 ? (
        <Card>
          <EmptyState
            icon={PackageCheck}
            title="Todo bien surtido"
            description="Ningún producto está agotado ni con poco stock. Cuando pase, aparece aquí."
          />
        </Card>
      ) : (
        <div className="space-y-8">
          {renderGroup('Agotados', out)}
          {renderGroup('Poco stock', low)}
        </div>
      )}

      <Sheet
        open={!!ordering}
        onClose={() => setOrdering(null)}
        title="Pedir a proveedor"
        description={ordering?.name}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" size="lg" onClick={() => setOrdering(null)}>
              Cancelar
            </Button>
            <Button variant="accent" size="lg" className="flex-1" onClick={confirm}>
              <MessageCircle className="size-5" />
              Ver mensaje
            </Button>
          </div>
        }
      >
        {ordering && (
          <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200 text-sm">
            {[
              ['Proveedor', `${suppliers[ordering.category].name} · ${suppliers[ordering.category].place}`],
              ['Cantidad sugerida', `${suggested(ordering)} unidades`],
              [
                'Detalle',
                ordering.sizes[0] === 'Única'
                  ? `3 de cada color (${ordering.colors.map((c) => c.name).join(', ')})`
                  : `2 por talla (${ordering.sizes.join(', ')}) en ${ordering.colors.map((c) => c.name).join(', ')}`,
              ],
              ['Se envía por', 'WhatsApp al proveedor'],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-3 px-4 py-3">
                <dt className="w-32 shrink-0 text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Sheet>

      <WhatsAppSheet
        draft={messaging && restockDraft(messaging, suppliers[messaging.category].name, suggested(messaging))}
        onClose={() => setMessaging(null)}
        onSent={() => messaging && requestRestock(messaging.id)}
      />
    </>
  )
}
