import { ArrowLeft, MessageCircle, Search } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { whatsappUrl } from '../../data/contact'
import { navSections, sectionHref, type Demo } from '../../data/demos'
import { cn } from '../../lib/cn'
import { formatLongDate } from '../../lib/format'
import { readStorage, writeStorage } from '../../lib/storage'
import { ReceiptContext, type Receipt } from '../share/receiptContext'
import { ReceiptSheet } from '../share/ReceiptSheet'
import { Logo } from '../ui/Logo'
import { PageSkeleton } from '../ui/Skeleton'
import { useToast } from '../ui/toastContext'
import { CommandPalette, type SearchItem } from './CommandPalette'
import { contentWidth } from './contentWidth'
import { DemoContext } from './DemoContext'
import { DemoMenu } from './DemoMenu'
import { useDemoTheme, type ThemeId } from './theme'
import { WelcomeTour } from './WelcomeTour'

const today = formatLongDate(new Date())

/** Lo que tarda el "cargando" la primera vez que se abre cada pantalla. */
const SKELETON_MS = 450

interface DemoLayoutProps {
  demo: Demo
  /** Todo lo que encuentra el buscador global de este demo. */
  searchItems: SearchItem[]
  searchPlaceholder: string
  /** Vuelve los datos del demo a su estado inicial. */
  onReset: () => void
  children: ReactNode
}

export function DemoLayout({ demo, searchItems, searchPlaceholder, onReset, children }: DemoLayoutProps) {
  const location = useLocation()
  const { pathname } = location
  // Al llegar desde el buscador se vuelve a montar la pantalla para que tome los filtros nuevos.
  const fromSearch = (location.state as { fromSearch?: boolean } | null)?.fromSearch
  const navigate = useNavigate()
  const toast = useToast()
  const [theme, setTheme] = useDemoTheme(demo)
  const [searchOpen, setSearchOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(() => readStorage(`dixicode:tour:${demo.slug}`) !== 'visto')
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const loading = useFirstVisitSkeleton(pathname)

  const sections = navSections(demo)
  const section = sections.find((s) => sectionHref(demo, s) === pathname.replace(/\/$/, ''))

  useEffect(() => {
    document.title = `${section ? `${section.label} · ` : ''}${demo.businessName} | Demo DixiCode`
  }, [demo, section])

  // Ctrl/⌘ K o "/" abren el buscador desde cualquier pantalla.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [contenteditable]')
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const closeTour = useCallback(() => {
    setTourOpen(false)
    writeStorage(`dixicode:tour:${demo.slug}`, 'visto')
  }, [demo.slug])

  const reset = () => {
    navigate(`/${demo.slug}`)
    onReset()
    toast('Demo reiniciado ✓', 'Los datos volvieron a como estaban al abrirlo.')
  }

  return (
    <DemoContext.Provider value={demo}>
      <ReceiptContext.Provider value={setReceipt}>
        <div className="min-h-dvh">
          <Sidebar demo={demo} />

          <div className="flex min-h-dvh flex-col xl:pl-64">
            <Header
              demo={demo}
              theme={theme}
              onTheme={setTheme}
              onSearch={() => setSearchOpen(true)}
              onTour={() => setTourOpen(true)}
              onReset={reset}
            />
            <main key={fromSearch ? location.key : pathname} className={cn(contentWidth, 'flex-1 animate-page-in pt-5 md:pt-6 xl:pt-8')}>
              {loading ? <PageSkeleton /> : children}
            </main>
            <Footer />
          </div>

          <BottomNav demo={demo} />
        </div>

        <CommandPalette
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          items={searchItems}
          placeholder={searchPlaceholder}
        />
        <ReceiptSheet receipt={receipt} onClose={() => setReceipt(null)} />
        <WelcomeTour demo={demo} open={tourOpen} onClose={closeTour} />
      </ReceiptContext.Provider>
    </DemoContext.Provider>
  )
}

/** Muestra un esqueleto breve solo la primera vez que se entra a cada pantalla. */
function useFirstVisitSkeleton(pathname: string): boolean {
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set())
  const loading = !visited.has(pathname)

  useEffect(() => {
    if (!loading) return
    const timer = window.setTimeout(() => setVisited((prev) => new Set(prev).add(pathname)), SKELETON_MS)
    return () => window.clearTimeout(timer)
  }, [loading, pathname])

  return loading
}

interface HeaderProps {
  demo: Demo
  theme: ThemeId
  onTheme: (theme: ThemeId) => void
  onSearch: () => void
  onTour: () => void
  onReset: () => void
}

function Header({ demo, theme, onTheme, onSearch, onTour, onReset }: HeaderProps) {
  const Icon = demo.icon
  const branded = theme === 'marca'
  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b pt-[env(safe-area-inset-top)] backdrop-blur-md transition-colors duration-300',
        branded
          ? 'border-transparent bg-gradient-to-r from-accent to-accent-strong text-white'
          : 'border-slate-200/80 bg-surface/90',
      )}
    >
      <div className={cn(contentWidth, 'flex h-16 items-center gap-2 md:gap-3')}>
        <Link
          to="/"
          aria-label="Volver a demos"
          className={cn(
            '-ml-1 grid size-9 shrink-0 place-items-center rounded-full transition-colors md:hidden',
            branded ? 'text-white hover:bg-white/15' : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <span
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-xl max-[419px]:hidden',
            branded ? 'bg-white/20 text-white' : 'bg-accent-soft text-accent',
          )}
        >
          <Icon className="size-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn('truncate text-[15px] leading-tight font-semibold md:text-base', branded ? 'text-white' : 'text-slate-900')}>
            {demo.businessName}
          </p>
          <p className={cn('truncate text-xs', branded ? 'text-white/80' : 'text-slate-500')}>
            {demo.businessType} · {demo.location}
          </p>
        </div>
        <p className={cn('hidden text-sm first-letter:uppercase 2xl:block', branded ? 'text-white/85' : 'text-slate-500')}>
          {today}
        </p>

        <button
          type="button"
          onClick={onSearch}
          aria-label="Buscar (Ctrl K)"
          className={cn(
            'flex h-9 shrink-0 items-center gap-2 rounded-full border text-sm shadow-card transition-all active:scale-95 max-md:w-9 max-md:justify-center md:w-56 md:px-3 lg:w-64',
            branded
              ? 'border-white/25 bg-white/15 text-white hover:bg-white/25'
              : 'border-slate-200 bg-surface text-slate-500 hover:border-slate-300 hover:text-slate-700',
          )}
        >
          <Search className="size-4 shrink-0" />
          <span className="flex-1 text-left max-md:hidden">Buscar…</span>
          <kbd
            className={cn(
              'rounded-md border px-1.5 text-[11px] font-medium max-md:hidden',
              branded ? 'border-white/30 text-white/85' : 'border-slate-200 text-slate-400',
            )}
          >
            Ctrl K
          </kbd>
        </button>
        <span
          className={cn(
            'hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold lg:inline',
            branded ? 'bg-white/20 text-white' : 'bg-accent-soft text-accent-ink',
          )}
        >
          Demo
        </span>
        <Link
          to="/"
          className="hidden h-9 shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-surface pr-3.5 pl-2.5 text-sm font-medium text-slate-700 shadow-card transition-colors hover:bg-slate-50 md:flex xl:hidden"
        >
          <ArrowLeft className="size-4" />
          Volver a demos
        </Link>
        <DemoMenu demo={demo} theme={theme} onTheme={onTheme} onTour={onTour} onReset={onReset} />
      </div>
    </header>
  )
}

function Sidebar({ demo }: { demo: Demo }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/80 bg-surface xl:flex">
      <div className="flex h-16 items-center border-b border-slate-100 px-6">
        <Link to="/" aria-label="Ir a la portada de DixiCode">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Secciones del demo">
        <p className="px-3 pb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">Menú</p>
        {navSections(demo).map((section) => {
          const Icon = section.icon
          return (
            <NavLink
              key={section.path}
              to={sectionHref(demo, section)}
              end
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-accent-soft text-accent-ink'
                    : 'text-slate-600 hover:translate-x-0.5 hover:bg-slate-50 hover:text-slate-900',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute top-2 bottom-2 -left-4 w-1 animate-fade-in rounded-r-full bg-accent" />}
                  <Icon className="size-5" />
                  {section.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
      <div className="space-y-3 border-t border-slate-100 p-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">¿Querés uno así para tu negocio?</p>
          <p className="mt-1 text-xs text-slate-500">Lo adaptamos a cómo trabajás vos.</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-card transition-all hover:-translate-y-px hover:bg-indigo-700 hover:shadow-raised"
          >
            <MessageCircle className="size-4" />
            Hablemos
          </a>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Volver a demos
        </Link>
      </div>
    </aside>
  )
}

function BottomNav({ demo }: { demo: Demo }) {
  const sections = navSections(demo)
  return (
    <nav
      aria-label="Secciones del demo"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md xl:hidden"
    >
      <div className="mx-auto grid h-16 max-w-xl" style={{ gridTemplateColumns: `repeat(${sections.length}, minmax(0, 1fr))` }}>
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <NavLink
              key={section.path}
              to={sectionHref(demo, section)}
              end
              className={({ isActive }) =>
                cn(
                  'flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:scale-95',
                  isActive ? 'text-accent-ink' : 'text-slate-500',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid h-7 w-12 place-items-center rounded-full transition-all duration-300',
                      isActive ? 'scale-100 bg-accent-soft' : 'scale-90',
                    )}
                  >
                    <Icon className="size-5" strokeWidth={isActive ? 2.3 : 2} />
                  </span>
                  <span className="max-w-full truncate px-0.5">{section.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="px-4 pt-10 pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-center text-xs text-slate-400 xl:pb-8">
      Hecho por{' '}
      <Link to="/" className="font-semibold text-slate-500 hover:text-indigo-600">
        DixiCode
      </Link>
      {' · '}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-slate-500 underline-offset-2 hover:text-indigo-600 hover:underline"
      >
        Hablemos
      </a>
    </footer>
  )
}
