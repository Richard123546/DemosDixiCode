import { todayKey } from './date'
import { normalize } from './text'

type Cell = string | number

/**
 * Descarga una tabla como CSV que Excel abre directo: separador ";" (Excel en español
 * usa la coma para decimales) y BOM para que respete tildes y el símbolo ₡.
 */
export function downloadCsv(name: string, header: string[], rows: Cell[][]): void {
  const escape = (cell: Cell) => {
    // Los formatos de hora y colones usan espacios sin salto; en Excel se ven raros.
    const text = String(cell).replace(/ /g, ' ')
    return /[;"\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const body = [header, ...rows].map((row) => row.map(escape).join(';')).join('\r\n')
  const blob = new Blob(['﻿', body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${name}-${todayKey()}.csv`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** "Studio Valeria" → "studio-valeria", para nombres de archivo. */
export function slugify(text: string): string {
  return normalize(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
