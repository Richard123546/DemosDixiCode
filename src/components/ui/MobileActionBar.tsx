import type { ReactNode } from 'react'

/**
 * Barra fija sobre la navegación inferior (móvil y tablet) para el total y la acción principal.
 * Incluye el espacio en blanco al final de la página para que no tape contenido.
 */
export function MobileActionBar({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="h-20 xl:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-slate-200/80 bg-surface/95 px-4 py-3 backdrop-blur-md xl:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">{children}</div>
      </div>
    </>
  )
}
