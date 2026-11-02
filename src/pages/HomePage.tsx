import { ArrowRight, Headset, MapPin, MessageCircle, MonitorSmartphone, Sparkles, Zap } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/ui/Logo'
import { whatsappUrl } from '../data/contact'
import { accentStyle, demos, type Demo } from '../data/demos'

const currentYear = new Date().getFullYear()

const benefits = [
  { icon: MonitorSmartphone, title: 'En celular y PC', text: 'Se usa desde el navegador, sin instalar nada. Igual de cómodo en el mostrador que en la casa.' },
  { icon: Zap, title: 'Listo en días', text: 'Partimos de una base probada y la ajustamos a tus productos, precios y forma de trabajar.' },
  { icon: Headset, title: 'Soporte local', text: 'Te atendemos por WhatsApp, en español y en horario tico. Nada de tickets eternos.' },
  { icon: MapPin, title: 'Hecho en Costa Rica', text: 'Colones, SINPE Móvil, IVA incluido y el vocabulario de tu negocio desde el primer día.' },
]

function WhatsAppLink({ className, children }: { className: string; children: ReactNode }) {
  return (
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}

export default function HomePage() {
  useEffect(() => {
    document.title = 'DixiCode · Sistemas que hacen crecer tu negocio'
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50">
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-6 xl:px-8">
        <Logo />
        <WhatsAppLink className="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-card transition-colors hover:bg-indigo-700">
          <MessageCircle className="size-4" />
          Hablemos
        </WhatsAppLink>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 md:px-6 xl:px-8">
        <section className="pt-12 pb-10 text-center md:pt-20 md:pb-14">
          <p className="mx-auto mb-5 flex w-fit items-center gap-1.5 rounded-full border border-indigo-100 bg-white px-3 py-1 text-xs font-medium text-indigo-700 shadow-card">
            <Sparkles className="size-3.5" />
            Demos interactivos · sin registrarse
          </p>
          <h1 className="mx-auto max-w-3xl text-[34px] leading-[1.1] font-bold tracking-tight text-balance text-slate-900 md:text-5xl xl:text-6xl">
            Sistemas que hacen crecer tu negocio
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-pretty text-slate-600 md:text-lg">
            Elegí un tipo de negocio y probá el sistema como si fuera tuyo. Todo funciona: tocá, agregá y cobrá.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="#demos"
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 font-semibold text-white shadow-card transition-colors hover:bg-slate-800"
            >
              Ver los demos
              <ArrowRight className="size-4" />
            </a>
            <WhatsAppLink className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 font-semibold text-slate-700 shadow-card transition-colors hover:bg-slate-50">
              <MessageCircle className="size-4" />
              Hablemos por WhatsApp
            </WhatsAppLink>
          </div>
        </section>

        <section id="demos" aria-label="Demos disponibles" className="scroll-mt-6">
          <div className="grid gap-4 md:grid-cols-3 md:gap-5 xl:gap-6">
            {demos.map((demo) => (
              <DemoCard key={demo.slug} demo={demo} />
            ))}
          </div>
        </section>

        <section className="mt-16 md:mt-24" aria-labelledby="beneficios">
          <h2 id="beneficios" className="text-center text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Pensado para el negocio de barrio
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-slate-600">
            Lo que necesitás para vender y ordenarte, sin pagar por funciones que nunca vas a usar.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card md:p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 px-6 py-10 text-center text-white shadow-raised md:mt-24 md:px-12 md:py-14">
          <h2 className="mx-auto max-w-xl text-2xl font-bold tracking-tight text-balance md:text-3xl">
            ¿Querés un sistema así para tu negocio?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-indigo-100">
            Contanos qué vendés y cómo trabajás. Te respondemos el mismo día con una propuesta a tu medida.
          </p>
          <WhatsAppLink className="mx-auto mt-7 flex h-12 w-fit items-center gap-2 rounded-xl bg-white px-6 font-semibold text-indigo-700 shadow-card transition-colors hover:bg-indigo-50">
            <MessageCircle className="size-5" />
            Hablemos
          </WhatsAppLink>
        </section>
      </main>

      <footer className="px-4 pt-12 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-xs text-slate-400">
        © {currentYear} DixiCode · Hecho en Costa Rica
      </footer>
    </div>
  )
}

function DemoCard({ demo }: { demo: Demo }) {
  const Icon = demo.icon
  return (
    <Link
      to={`/${demo.slug}`}
      style={accentStyle(demo)}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent-muted hover:shadow-raised active:scale-[0.99] md:p-7"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
      <span className="grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent">
        <Icon className="size-7" strokeWidth={2} />
      </span>
      <p className="mt-5 text-xs font-semibold tracking-wider text-accent uppercase">{demo.businessType}</p>
      <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">{demo.businessName}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{demo.problem}</p>
      <ul className="mt-5 grid flex-1 grid-cols-2 content-start gap-2 border-t border-slate-100 pt-5">
        {demo.sections.map((section) => {
          const SectionIcon = section.icon
          return (
            <li key={section.path} className="flex items-center gap-2 text-sm text-slate-600">
              <SectionIcon className="size-4 shrink-0 text-accent" />
              {section.label}
            </li>
          )
        })}
      </ul>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-strong">
        Probar demo
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
