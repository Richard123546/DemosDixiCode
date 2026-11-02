import { createContext, useContext } from 'react'
import type { Demo } from '../../data/demos'

export const DemoContext = createContext<Demo | null>(null)

export function useDemo(): Demo {
  const demo = useContext(DemoContext)
  if (!demo) throw new Error('useDemo debe usarse dentro de DemoLayout')
  return demo
}
