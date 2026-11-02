import { CircleCheck } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ToastContext, type ShowToast } from './toastContext'

interface ToastMessage {
  id: number
  title: string
  description?: string
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const show = useCallback<ShowToast>((title, description) => {
    setToast({ id: Date.now(), title, description })
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[60] flex justify-center px-4 xl:top-auto xl:right-6 xl:bottom-6 xl:left-auto xl:justify-end"
      >
        {toast && (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-overlay"
          >
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-400" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && <p className="mt-0.5 text-sm text-slate-300">{toast.description}</p>}
            </div>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}
