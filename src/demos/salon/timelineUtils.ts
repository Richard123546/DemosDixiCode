import { useEffect, useState, type MouseEvent } from 'react'
import { CLOSE_MINUTE, OPEN_MINUTE, type Appointment } from '../../data/salon'
import { nowMinutes } from '../../lib/date'
import { endOf } from './selectors'

export const HOURS = Array.from({ length: (CLOSE_MINUTE - OPEN_MINUTE) / 60 + 1 }, (_, i) => OPEN_MINUTE / 60 + i)

export interface Placement {
  appointment: Appointment
  lane: number
  lanes: number
}

/** Reparte citas que se traslapan en carriles lado a lado. */
export function layoutLanes(appointments: Appointment[]): Placement[] {
  const sorted = [...appointments].sort((a, b) => a.start - b.start || endOf(b) - endOf(a))
  const result: Placement[] = []
  let cluster: Placement[] = []
  let laneEnds: number[] = []
  let clusterEnd = -1

  const flush = () => {
    for (const p of cluster) p.lanes = laneEnds.length
    result.push(...cluster)
    cluster = []
    laneEnds = []
  }

  for (const appointment of sorted) {
    if (appointment.start >= clusterEnd) flush()
    let lane = laneEnds.findIndex((end) => end <= appointment.start)
    if (lane === -1) lane = laneEnds.push(0) - 1
    laneEnds[lane] = endOf(appointment)
    clusterEnd = Math.max(clusterEnd, endOf(appointment))
    cluster.push({ appointment, lane, lanes: 1 })
  }
  flush()
  return result
}

/** Minuto actual, refrescado cada 30 s. */
export function useNowMinutes(): number {
  const [now, setNow] = useState(nowMinutes)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(nowMinutes()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  return now
}

/** Convierte un clic en la columna en una hora redondeada a 15 min. */
export function minuteFromClick(e: MouseEvent<HTMLElement>, pxPerMinute: number): number {
  const rect = e.currentTarget.getBoundingClientRect()
  const minute = OPEN_MINUTE + (e.clientY - rect.top) / pxPerMinute
  return Math.max(OPEN_MINUTE, Math.min(CLOSE_MINUTE - 15, Math.floor(minute / 15) * 15))
}
