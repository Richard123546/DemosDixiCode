/** Minúsculas y sin tildes, para búsquedas ("Solís" coincide con "solis"). */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  // En Costa Rica el apellido principal es el primero: "María Fernanda Solís Rojas" → "MS".
  const surname = parts.length >= 3 ? parts[parts.length - 2] : parts[1]
  return ((parts[0]?.[0] ?? '') + (surname?.[0] ?? '')).toUpperCase()
}

/** "María Fernanda Solís" → "María Fernanda S." */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 2) return parts[0]
  return `${parts.slice(0, -2).join(' ')} ${parts[parts.length - 2][0]}.`
}
