/**
 * localStorage puede fallar (modo privado, cookies bloqueadas, cuota llena):
 * en ese caso se sigue sin recordar nada en lugar de romper la página.
 */
export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Sin almacenamiento disponible: la preferencia dura solo esta visita.
  }
}
