import { X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

/**
 * Bottom sheet en móvil; modal centrado desde tablet en adelante.
 * Va en un portal para que ningún contenedor con blur o transform lo recorte.
 */
export function Sheet({ open, onClose, title, description, children, footer }: SheetProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <div className="absolute inset-0 animate-fade-in bg-black/45 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[90dvh] w-full animate-sheet-up flex-col rounded-t-3xl bg-surface shadow-overlay md:max-w-lg md:animate-modal-in md:rounded-2xl"
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-slate-200 md:hidden" />
        <header className="flex items-start justify-between gap-4 px-5 pt-4 pb-3 md:px-6 md:pt-6">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-1 grid size-9 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </header>
        <div className="overflow-y-auto px-5 pb-5 md:px-6">{children}</div>
        {footer && (
          <footer className="border-t border-slate-100 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6 md:pb-5">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}
