import type { CSSProperties } from 'react'
import {
  BellRing,
  ChefHat,
  CalendarDays,
  ChartColumn,
  ClipboardList,
  Gem,
  House,
  LayoutGrid,
  Package,
  Receipt,
  ShoppingBag,
  Sparkles,
  Users,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export type DemoSlug = 'salon' | 'soda' | 'boutique'

export interface DemoSection {
  /** Segmento de URL; vacío para la sección inicial. */
  path: string
  label: string
  icon: LucideIcon
  description: string
}

export interface DemoAccent {
  base: string
  strong: string
  soft: string
  muted: string
}

export interface Demo {
  slug: DemoSlug
  businessName: string
  businessType: string
  location: string
  /** Teléfono del negocio para SINPE Móvil y comprobantes. */
  phone: string
  problem: string
  icon: LucideIcon
  accent: DemoAccent
  /** Secciones de trabajo; "Inicio" (resumen) va siempre antes, ver navSections. */
  sections: [DemoSection, DemoSection, DemoSection, DemoSection]
}

export const salonDemo: Demo = {
  slug: 'salon',
  businessName: 'Studio Valeria',
  businessType: 'Uñas y Belleza',
  location: 'Coronado',
  phone: '8888-0123',
  problem: 'Agenda de citas sin cruces ni olvidos, y la caja del día siempre clara.',
  icon: Sparkles,
  accent: { base: '#db2777', strong: '#be185d', soft: '#fdf2f8', muted: '#fce7f3' },
  sections: [
    { path: 'agenda', label: 'Agenda', icon: CalendarDays, description: 'Citas del día por hora, sin choques de horario.' },
    { path: 'caja', label: 'Caja', icon: Wallet, description: 'Lo ganado hoy, esta semana y este mes.' },
    { path: 'clientas', label: 'Clientas', icon: Users, description: 'Historial de cada clienta y lo que ha gastado.' },
    { path: 'servicios', label: 'Servicios', icon: Gem, description: 'Catálogo con precios y duración.' },
  ],
}

export const sodaDemo: Demo = {
  slug: 'soda',
  businessName: 'Soda La Esquina',
  businessType: 'Comida típica',
  location: 'Coronado',
  phone: '8712-0456',
  problem: 'Mesas, comandas a cocina y cierre de caja sin papelitos.',
  icon: UtensilsCrossed,
  accent: { base: '#ea580c', strong: '#c2410c', soft: '#fff7ed', muted: '#ffedd5' },
  sections: [
    { path: 'mesas', label: 'Mesas', icon: LayoutGrid, description: 'Estado de cada mesa y lo que lleva consumido.' },
    { path: 'pedido', label: 'Pedido', icon: ClipboardList, description: 'Agregar platos, enviar a cocina y cobrar.' },
    { path: 'cocina', label: 'Cocina', icon: ChefHat, description: 'Comandas pendientes en orden de llegada.' },
    { path: 'cierre', label: 'Cierre', icon: ChartColumn, description: 'Resumen de ventas del día.' },
  ],
}

export const boutiqueDemo: Demo = {
  slug: 'boutique',
  businessName: 'Boutique Amara',
  businessType: 'Moda femenina',
  location: 'Coronado',
  phone: '8309-1177',
  problem: 'Inventario por talla y color al día, y ventas que descuentan solas.',
  icon: ShoppingBag,
  accent: { base: '#059669', strong: '#047857', soft: '#ecfdf5', muted: '#d1fae5' },
  sections: [
    { path: 'inventario', label: 'Inventario', icon: Package, description: 'Stock por talla y color de cada producto.' },
    { path: 'vender', label: 'Vender', icon: Receipt, description: 'Buscá, elegí talla y color, y cobrá.' },
    { path: 'alertas', label: 'Alertas', icon: BellRing, description: 'Productos agotados o con poco stock.' },
    { path: 'reportes', label: 'Reportes', icon: ChartColumn, description: 'Ventas, productos estrella y categorías.' },
  ],
}

export const demos: Demo[] = [salonDemo, sodaDemo, boutiqueDemo]

export const homeSection: DemoSection = {
  path: '',
  label: 'Inicio',
  icon: House,
  description: 'Resumen del día con los números clave.',
}

/** Menú del demo: Inicio y las cuatro secciones de trabajo. */
export function navSections(demo: Demo): DemoSection[] {
  return [homeSection, ...demo.sections]
}

export function sectionHref(demo: Demo, section: DemoSection): string {
  return section.path ? `/${demo.slug}/${section.path}` : `/${demo.slug}`
}

/** Variables CSS que activan el color de acento del demo en un bloque (ver index.css). */
export function accentStyle(demo: Demo): CSSProperties {
  return {
    '--accent': demo.accent.base,
    '--accent-strong': demo.accent.strong,
    '--accent-soft': demo.accent.soft,
    '--accent-muted': demo.accent.muted,
    '--accent-ink': demo.accent.strong,
  } as CSSProperties
}
