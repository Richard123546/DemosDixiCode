import { useLayoutEffect, useState } from 'react'
import type { Demo } from '../../data/demos'
import { readStorage, writeStorage } from '../../lib/storage'

export type ThemeId = 'claro' | 'oscuro' | 'marca'

export interface ThemeOption {
  id: ThemeId
  label: string
  description: string
}

export const themeOptions: ThemeOption[] = [
  { id: 'claro', label: 'Moderno claro', description: 'Limpio y neutro, en índigo.' },
  { id: 'oscuro', label: 'Oscuro elegante', description: 'Descansa la vista de noche.' },
  { id: 'marca', label: 'Color de marca', description: 'Con el color del negocio.' },
]

const STORAGE_KEY = 'dixicode:tema'

function initialTheme(): ThemeId {
  const saved = readStorage(STORAGE_KEY)
  if (themeOptions.some((t) => t.id === saved)) return saved as ThemeId
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'marca'
}

/** Color de la barra del navegador en el celular, según el tema. */
function browserBarColor(demo: Demo, theme: ThemeId): string {
  if (theme === 'oscuro') return '#0a0f1c'
  return theme === 'marca' ? demo.accent.base : '#ffffff'
}

/**
 * Tema elegido (se recuerda entre visitas y es el mismo para los tres demos).
 * Aplica en <html> el tema y el color de marca para que también lo tomen el fondo,
 * los avisos y las hojas; al salir del demo se deja todo como estaba.
 */
export function useDemoTheme(demo: Demo) {
  const [theme, setThemeState] = useState<ThemeId>(initialTheme)

  useLayoutEffect(() => {
    const root = document.documentElement
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const previousBar = meta?.content
    root.dataset.theme = theme
    root.style.setProperty('--brand', demo.accent.base)
    root.style.setProperty('--brand-strong', demo.accent.strong)
    root.style.setProperty('--brand-soft', demo.accent.soft)
    root.style.setProperty('--brand-muted', demo.accent.muted)
    if (meta) meta.content = browserBarColor(demo, theme)
    return () => {
      delete root.dataset.theme
      for (const name of ['--brand', '--brand-strong', '--brand-soft', '--brand-muted']) root.style.removeProperty(name)
      if (meta && previousBar) meta.content = previousBar
    }
  }, [demo, theme])

  const setTheme = (next: ThemeId) => {
    setThemeState(next)
    writeStorage(STORAGE_KEY, next)
  }

  return [theme, setTheme] as const
}
