import { ArrowRight, Ellipsis, Palette, RotateCcw, Search, Sparkles, type LucideIcon } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { navSections, type Demo } from '../../data/demos'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'

interface Step {
  icon: LucideIcon
  title: string
  body: ReactNode
}

function stepsFor(demo: Demo): Step[] {
  return [
    {
      icon: demo.icon,
      title: `Bienvenida a ${demo.businessName}`,
      body: (
        <>
          <p>{demo.problem}</p>
          <p className="mt-2">
            Es un demo que funciona de verdad: agregá, cobrá y probá sin miedo. Nada de lo que hagás se guarda en serio.
          </p>
        </>
      ),
    },
    {
      icon: Sparkles,
      title: 'Todo a mano en 5 pantallas',
      body: (
        <>
          <p>Empezás en Inicio con los números del día. Para moverte usá el menú de abajo (a la izquierda en PC).</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
            {navSections(demo).map((section) => {
              const Icon = section.icon
              return (
                <li
                  key={section.path}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-ink"
                >
                  <Icon className="size-3.5" />
                  {section.label}
                </li>
              )
            })}
          </ul>
        </>
      ),
    },
    {
      icon: Palette,
      title: 'Detalles que ahorran tiempo',
      body: (
        <ul className="space-y-2.5 text-left">
          <Tip icon={Search}>
            <b className="text-slate-900">Buscador rápido:</b> la lupa de arriba o Ctrl K encuentra lo que sea.
          </Tip>
          <Tip icon={Ellipsis}>
            <b className="text-slate-900">Tu estilo:</b> en el menú ⋯ elegís claro, oscuro o con el color de la marca.
          </Tip>
          <Tip icon={RotateCcw}>
            <b className="text-slate-900">Reiniciar demo:</b> también en ⋯, deja todo como al principio.
          </Tip>
        </ul>
      ),
    },
  ]
}

function Tip({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="size-4" />
      </span>
      <span className="pt-1">{children}</span>
    </li>
  )
}

/** Tour de 3 pasos que aparece la primera vez que se abre cada demo; se puede saltar. */
export function WelcomeTour({ demo, open, onClose }: { demo: Demo; open: boolean; onClose: () => void }) {
  if (!open) return null
  return <Tour demo={demo} onClose={onClose} />
}

function Tour({ demo, onClose }: { demo: Demo; onClose: () => void }) {
  const steps = stepsFor(demo)
  const [index, setIndex] = useState(0)
  const step = steps[index]
  const last = index === steps.length - 1
  const Icon = step.icon

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[58] flex items-end justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:items-center md:p-6">
      <div className="absolute inset-0 animate-fade-in bg-black/50 backdrop-blur-[3px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        className="relative w-full max-w-md animate-modal-in overflow-hidden rounded-3xl bg-surface shadow-overlay"
      >
        <div className="relative grid h-36 place-items-center overflow-hidden bg-gradient-to-br from-accent to-accent-strong">
          <span className="absolute -top-10 -left-8 size-36 rounded-full bg-white/10" aria-hidden />
          <span className="absolute -right-6 -bottom-14 size-40 rounded-full bg-white/10" aria-hidden />
          <span key={index} className="relative grid size-16 animate-pop-in place-items-center rounded-2xl bg-white/95 text-accent shadow-raised">
            <Icon className="size-8" strokeWidth={1.8} />
          </span>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/25"
          >
            Saltar
          </button>
        </div>

        <div key={index} className="animate-step-in px-6 pt-5 pb-2 text-center">
          <p className="text-xs font-semibold tracking-wider text-accent-ink uppercase">
            Paso {index + 1} de {steps.length}
          </p>
          <h2 id="tour-title" className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            {step.title}
          </h2>
          <div className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</div>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 pt-4 pb-6">
          <div className="flex gap-1.5" aria-hidden>
            {steps.map((_, i) => (
              <span
                key={i}
                className={cn('h-2 rounded-full transition-all duration-300', i === index ? 'w-6 bg-accent' : 'w-2 bg-slate-200')}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {index > 0 && (
              <Button variant="ghost" onClick={() => setIndex(index - 1)}>
                Atrás
              </Button>
            )}
            <Button variant="accent" onClick={() => (last ? onClose() : setIndex(index + 1))}>
              {last ? 'Empezar' : 'Siguiente'}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
