import { CornerDownLeft, Search, SearchX, type LucideIcon } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { normalize } from '../../lib/text'

export interface SearchItem {
  id: string
  /** Grupo en la lista de resultados: "Secciones", "Clientas"… */
  group: string
  title: string
  subtitle?: string
  icon: LucideIcon
  /** Ruta a la que lleva, con parámetros si hace falta ("/salon/clientas?q=Karla"). */
  to: string
  /** Texto extra que también se busca (teléfono, categoría, colores…). */
  keywords?: string
}

const MAX_RESULTS = 30

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  items: SearchItem[]
  placeholder: string
}

/** Buscador global: Ctrl/⌘ K o la lupa del encabezado. */
export function CommandPalette({ open, ...props }: CommandPaletteProps) {
  if (!open) return null
  return <Palette {...props} />
}

function Palette({ onClose, items, placeholder }: Omit<CommandPaletteProps, 'open'>) {
  const navigate = useNavigate()
  const listId = useId()
  const listRef = useRef<HTMLUListElement>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const results = useMemo(() => {
    const words = normalize(query.trim()).split(/\s+/).filter(Boolean)
    // Sin texto: solo las secciones, como atajo de navegación.
    if (!words.length) return items.filter((item) => item.group === 'Secciones')
    return items
      .filter((item) => {
        const text = normalize(`${item.title} ${item.subtitle ?? ''} ${item.keywords ?? ''}`)
        return words.every((w) => text.includes(w))
      })
      .slice(0, MAX_RESULTS)
  }, [items, query])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const go = (item: SearchItem) => {
    onClose()
    // La marca hace que la pantalla se vuelva a montar aunque ya estuviera abierta (ver DemoLayout).
    navigate(item.to, { state: { fromSearch: true } })
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown' && results.length) {
      e.preventDefault()
      setActive((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp' && results.length) {
      e.preventDefault()
      setActive((i) => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault()
      go(results[active])
    }
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-start justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-6 md:pt-[12vh]">
      <div className="absolute inset-0 animate-fade-in bg-black/45 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscador rápido"
        className="relative flex max-h-[min(34rem,80dvh)] w-full max-w-xl animate-slide-down flex-col overflow-hidden rounded-2xl bg-surface shadow-overlay ring-1 ring-slate-200"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4">
          <Search className="size-5 shrink-0 text-slate-400" />
          <input
            autoFocus
            type="search"
            role="combobox"
            aria-expanded
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden rounded-md border border-slate-200 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 md:block">
            Esc
          </kbd>
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <SearchX className="size-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-900">Sin resultados para “{query}”</p>
            <p className="mt-1 text-sm text-slate-500">Probá con otra palabra o con menos letras.</p>
          </div>
        ) : (
          <ul ref={listRef} id={listId} role="listbox" className="overflow-y-auto overscroll-contain p-2">
            {results.map((item, i) => {
              const Icon = item.icon
              const newGroup = i === 0 || results[i - 1].group !== item.group
              return (
                <li key={item.id} role="presentation">
                  {newGroup && (
                    <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                      {item.group}
                    </p>
                  )}
                  <button
                    type="button"
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    data-index={i}
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(item)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      i === active ? 'bg-accent-soft' : 'hover:bg-slate-50',
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-lg transition-colors',
                        i === active ? 'bg-accent text-white' : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block truncate text-sm font-medium', i === active ? 'text-accent-ink' : 'text-slate-900')}>
                        {item.title}
                      </span>
                      {item.subtitle && <span className="block truncate text-xs text-slate-500">{item.subtitle}</span>}
                    </span>
                    {i === active && <CornerDownLeft className="size-4 shrink-0 text-accent-ink max-md:hidden" />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <p className="hidden items-center gap-3 border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400 md:flex">
          <span>↑ ↓ para moverte</span>
          <span>Enter para abrir</span>
          <span className="ml-auto">Ctrl K para abrir desde cualquier pantalla</span>
        </p>
      </div>
    </div>
  )
}
