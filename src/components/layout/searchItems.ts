import { navSections, sectionHref, type Demo } from '../../data/demos'
import type { SearchItem } from './CommandPalette'

/** Las pantallas del demo, primeras en el buscador. */
export function sectionSearchItems(demo: Demo): SearchItem[] {
  return navSections(demo).map((section) => ({
    id: `seccion-${section.label}`,
    group: 'Secciones',
    title: section.label,
    subtitle: section.description,
    icon: section.icon,
    to: sectionHref(demo, section),
  }))
}
