import { LayoutGrid, Minus, Plus, Star } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChargeSheet } from '../../components/payment/ChargeSheet'
import { useReceipt } from '../../components/share/receiptContext'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { FilterChips } from '../../components/ui/Chips'
import { EmptyState } from '../../components/ui/EmptyState'
import { MobileActionBar } from '../../components/ui/MobileActionBar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Sheet } from '../../components/ui/Sheet'
import { useToast } from '../../components/ui/toastContext'
import { paymentMethods } from '../../data/payments'
import { menu, menuCategories, type MenuCategory, type MenuItem, type OrderLine } from '../../data/soda'
import { cn } from '../../lib/cn'
import { formatColones } from '../../lib/format'
import { OrderSummary } from './OrderSummary'
import { saleReceipt } from './share'
import { linesCount, linesTotal, tableStatus, unsentCount } from './selectors'
import { useSoda } from './sodaStore'
import { tableStatusStyles } from './tableStatusStyles'
import { TableStatusBadge } from './TableStatusBadge'

export default function PedidoPage() {
  const { tables, tickets, addItem, removeItem, sendToKitchen, chargeTable } = useSoda()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const showReceipt = useReceipt()
  // ?categoria=Bebidas abre esa parte del menú (lo usa el buscador).
  const [category, setCategory] = useState<MenuCategory>(
    () =>
      menuCategories.find((c) => c.id === params.get('categoria'))?.id ??
      (new Date().getHours() < 11 ? 'Desayunos' : 'Casados'),
  )
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [chargeOpen, setChargeOpen] = useState(false)

  const table = tables.find((t) => t.id === Number(params.get('mesa')))
  const selectTable = (id: number) => setParams({ mesa: String(id) }, { replace: true })

  const send = () => {
    if (!table) return
    const ticket = sendToKitchen(table.id)
    if (ticket) {
      toast(`Comanda #${ticket.number} enviada a cocina ✓`, `Mesa ${table.id} · ${linesCount(ticket.lines)} productos`)
      setSummaryOpen(false)
    }
  }

  const charge = (method: keyof typeof paymentMethods) => {
    if (!table) return
    const sale = chargeTable(table.id, method)
    if (!sale) return
    toast(`Mesa ${table.id} cobrada ✓`, `${formatColones(sale.total)} · ${paymentMethods[method]}`)
    setChargeOpen(false)
    setSummaryOpen(false)
    navigate('/soda/mesas')
    showReceipt(saleReceipt(sale))
  }

  const status = table ? tableStatus(table, tickets) : null

  return (
    <>
      <PageHeader
        title={table ? `Pedido · Mesa ${table.id}` : 'Pedido'}
        description={table ? `${table.seats} personas` : 'Elegí la mesa para tomar el pedido.'}
        actions={status && <TableStatusBadge status={status} className="text-sm" />}
      />

      <TablePicker selectedId={table?.id} onSelect={selectTable} />

      {!table ? (
        <Card>
          <EmptyState
            icon={LayoutGrid}
            title="¿Para qué mesa es?"
            description="Elegí una mesa arriba o desde la vista de Mesas."
            action={
              <Button variant="secondary" onClick={() => navigate('/soda/mesas')}>
                Ver mesas
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start xl:gap-6">
          <div className="min-w-0">
            <CategoryTabs value={category} onChange={setCategory} />
            <div key={category} className="grid animate-fade-in gap-2.5 md:grid-cols-2 md:gap-3 2xl:grid-cols-3">
              {menu
                .filter((item) => item.category === category)
                .map((item) => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    line={table.lines.find((l) => l.itemId === item.id)}
                    onAdd={() => addItem(table.id, item.id)}
                    onRemove={() => removeItem(table.id, item.id)}
                  />
                ))}
            </div>
          </div>

          <Card className="sticky top-24 hidden p-5 xl:block">
            <h2 className="mb-1 font-semibold text-slate-900">Resumen · Mesa {table.id}</h2>
            <OrderSummary table={table} tickets={tickets} onSend={send} onCharge={() => setChargeOpen(true)} />
          </Card>

          <MobileActionBar>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500">
                {linesCount(table.lines)} productos
                {unsentCount(table) > 0 && <span className="font-medium text-amber-700"> · {unsentCount(table)} sin enviar</span>}
              </p>
              <p key={linesTotal(table.lines)} className="animate-fade-in text-xl font-bold text-slate-900 tabular-nums">
                {formatColones(linesTotal(table.lines))}
              </p>
            </div>
            <Button variant="accent" size="lg" onClick={() => setSummaryOpen(true)} disabled={table.lines.length === 0}>
              Ver pedido
            </Button>
          </MobileActionBar>

          <Sheet open={summaryOpen} onClose={() => setSummaryOpen(false)} title={`Pedido · Mesa ${table.id}`}>
            <OrderSummary
              table={table}
              tickets={tickets}
              onSend={send}
              onCharge={() => {
                setSummaryOpen(false)
                setChargeOpen(true)
              }}
            />
          </Sheet>

          <ChargeSheet
            open={chargeOpen}
            title={`Registrar pago · Mesa ${table.id}`}
            description={`${linesCount(table.lines)} productos`}
            total={linesTotal(table.lines)}
            onClose={() => setChargeOpen(false)}
            onConfirm={charge}
          />
        </div>
      )}
    </>
  )
}

function TablePicker({ selectedId, onSelect }: { selectedId?: number; onSelect: (id: number) => void }) {
  const { tables, tickets } = useSoda()
  return (
    <FilterChips
      label="Mesas"
      className="mb-4"
      value={selectedId}
      onChange={onSelect}
      options={tables.map((t) => ({
        value: t.id,
        label: (
          <>
            <span className={cn('size-2 rounded-full', tableStatusStyles[tableStatus(t, tickets)].dot)} />
            Mesa {t.id}
          </>
        ),
      }))}
    />
  )
}

function CategoryTabs({ value, onChange }: { value: MenuCategory; onChange: (c: MenuCategory) => void }) {
  return (
    <div className="-mx-4 mb-4 grid auto-cols-[minmax(5.5rem,1fr)] grid-flow-col gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
      {menuCategories.map(({ id, icon: Icon }) => {
        const selected = id === value
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={selected}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-xs font-semibold whitespace-nowrap transition-all duration-200',
              selected
                ? 'border-accent bg-accent-soft text-accent-ink shadow-card'
                : 'border-slate-200 bg-surface text-slate-600 hover:border-slate-300',
            )}
          >
            <Icon className="size-5" />
            {id}
          </button>
        )
      })}
    </div>
  )
}

function MenuItemRow({
  item,
  line,
  onAdd,
  onRemove,
}: {
  item: MenuItem
  line?: OrderLine
  onAdd: () => void
  onRemove: () => void
}) {
  const qty = line?.qty ?? 0
  const sent = line?.sent ?? 0
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border bg-surface p-3.5 shadow-card transition-colors duration-200 md:p-4',
        qty > 0 ? 'border-accent/40 bg-accent-soft/40' : 'border-slate-200/80',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 font-semibold text-slate-900">
          <span className="truncate">{item.name}</span>
          {item.popular && <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" aria-label="Popular" />}
        </p>
        {item.description && <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{item.description}</p>}
        <p className="mt-1 flex items-center gap-2">
          <span className="font-semibold text-slate-900 tabular-nums">{formatColones(item.price)}</span>
          {sent > 0 && <span className="text-xs text-slate-400">· {sent} en cocina</span>}
        </p>
      </div>

      {qty === 0 ? (
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Agregar ${item.name}`}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-white shadow-card transition-transform hover:bg-accent-strong active:scale-90"
        >
          <Plus className="size-5" />
        </button>
      ) : (
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-surface p-1 shadow-card ring-1 ring-slate-200">
          <button
            type="button"
            onClick={onRemove}
            disabled={qty <= sent}
            aria-label={`Quitar ${item.name}`}
            title={qty <= sent ? 'Ya está en cocina' : undefined}
            className="grid size-9 place-items-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 active:scale-90 disabled:opacity-30"
          >
            <Minus className="size-4" />
          </button>
          <span key={qty} className="w-6 animate-pop-in text-center font-bold text-slate-900 tabular-nums">
            {qty}
          </span>
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Agregar otro ${item.name}`}
            className="grid size-9 place-items-center rounded-full bg-accent text-white transition-transform hover:bg-accent-strong active:scale-90"
          >
            <Plus className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
