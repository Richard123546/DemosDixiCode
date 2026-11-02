import { ArrowLeft, Check, Ellipsis, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Demo } from '../../data/demos'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'
import { Sheet } from '../ui/Sheet'
import { themeOptions, type ThemeId } from './theme'

interface DemoMenuProps {
  demo: Demo
  theme: ThemeId
  onTheme: (theme: ThemeId) => void
  onTour: () => void
  onReset: () => void
}

/** Menú ⋯ del encabezado: estilo visual, tour y reiniciar el demo. */
export function DemoMenu({ demo, theme, onTheme, onTour, onReset }: DemoMenuProps) {
  const [open, setOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Opciones del demo"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'grid size-9 place-items-center rounded-full border border-slate-200 bg-surface text-slate-600 shadow-card transition-all hover:bg-slate-50 active:scale-90',
          open && 'border-accent/40 bg-accent-soft text-accent-ink',
        )}
      >
        <Ellipsis className="size-5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 w-[min(19rem,calc(100vw-2rem))] origin-top-right animate-slide-down rounded-2xl border border-slate-200/80 bg-surface p-2 text-slate-900 shadow-overlay"
        >
          <p className="px-2 pt-1 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Estilo</p>
          <div role="radiogroup" aria-label="Estilo visual" className="space-y-1">
            {themeOptions.map((option) => {
              const selected = option.id === theme
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onTheme(option.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors',
                    selected ? 'bg-accent-soft' : 'hover:bg-slate-50',
                  )}
                >
                  <ThemePreview id={option.id} demo={demo} />
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-sm font-semibold', selected ? 'text-accent-ink' : 'text-slate-900')}>
                      {option.label}
                    </span>
                    <span className="block text-xs text-slate-500">{option.description}</span>
                  </span>
                  {selected && <Check className="size-4 shrink-0 animate-pop-in text-accent-ink" />}
                </button>
              )
            })}
          </div>

          <div className="my-2 border-t border-slate-100" />
          <MenuItem
            icon={<Sparkles className="size-4" />}
            onClick={() => {
              setOpen(false)
              onTour()
            }}
          >
            Ver el tour de bienvenida
          </MenuItem>
          <MenuItem
            icon={<RotateCcw className="size-4" />}
            onClick={() => {
              setOpen(false)
              setConfirmReset(true)
            }}
          >
            Reiniciar demo
          </MenuItem>
          <Link
            to="/"
            role="menuitem"
            className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-500">
              <ArrowLeft className="size-4" />
            </span>
            Volver a demos
          </Link>
        </div>
      )}

      <Sheet
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="¿Reiniciar el demo?"
        description="Se borra todo lo que agregaste o cobraste y los datos vuelven a como estaban al abrirlo."
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" size="lg" onClick={() => setConfirmReset(false)}>
              Cancelar
            </Button>
            <Button
              variant="accent"
              size="lg"
              className="flex-1"
              onClick={() => {
                setConfirmReset(false)
                onReset()
              }}
            >
              <RotateCcw className="size-5" />
              Sí, reiniciar
            </Button>
          </div>
        }
      >
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Ideal antes de mostrárselo a otra persona: cada visita empieza con el mismo día de trabajo de{' '}
          <span className="font-semibold text-slate-900">{demo.businessName}</span>.
        </p>
      </Sheet>
    </div>
  )
}

function MenuItem({ icon, onClick, children }: { icon: ReactNode; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
    >
      <span className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-500">{icon}</span>
      {children}
    </button>
  )
}

/** Miniatura del tema con colores fijos, para que se vea igual sin importar el tema activo. */
function ThemePreview({ id, demo }: { id: ThemeId; demo: Demo }) {
  const colors = {
    claro: { bg: '#f8fafc', card: '#ffffff', line: '#e2e8f0', accent: '#4f46e5' },
    oscuro: { bg: '#0a0f1c', card: '#131a2a', line: '#273148', accent: demo.accent.base },
    marca: { bg: demo.accent.soft, card: '#ffffff', line: demo.accent.muted, accent: demo.accent.base },
  }[id]
  return (
    <span
      aria-hidden
      className="relative flex size-11 shrink-0 flex-col gap-1 overflow-hidden rounded-lg p-1.5 ring-1 ring-black/10"
      style={{ background: colors.bg }}
    >
      <span className="h-2 rounded-sm" style={{ background: id === 'marca' ? colors.accent : colors.card }} />
      <span className="flex flex-1 gap-1">
        <span className="flex-1 rounded-sm" style={{ background: colors.card, boxShadow: `inset 0 0 0 1px ${colors.line}` }} />
        <span className="w-2 rounded-sm" style={{ background: colors.accent }} />
      </span>
    </span>
  )
}
