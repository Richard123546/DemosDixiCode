import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sectionHref } from '../../data/demos'
import { useDemo } from '../layout/DemoContext'

/** Tarjetas para saltar a cada sección del demo desde Inicio. */
export function SectionShortcuts() {
  const demo = useDemo()
  return (
    <section className="mt-6 md:mt-8" aria-labelledby="atajos">
      <h2 id="atajos" className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
        Ir a
      </h2>
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4 xl:gap-5">
        {demo.sections.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.path}
              to={sectionHref(demo, section)}
              className="group flex flex-col rounded-2xl border border-slate-200/80 bg-surface p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-muted hover:shadow-raised active:scale-[0.98] md:p-5"
            >
              <span className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <ArrowUpRight className="size-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
              </span>
              <span className="mt-3 font-semibold text-slate-900">{section.label}</span>
              <span className="mt-0.5 line-clamp-2 text-xs text-slate-500 md:text-sm">{section.description}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
