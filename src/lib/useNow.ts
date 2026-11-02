import { useEffect, useState } from 'react'

/** Timestamp actual que se refresca cada `intervalMs`, para contadores en vivo. */
export function useNow(intervalMs = 15_000): number {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])
  return now
}
