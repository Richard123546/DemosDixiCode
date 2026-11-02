import { addDays, diffDays, fromDateKey, startOfWeek, type DateKey } from '../lib/date'
import { createRng } from '../lib/random'
import type { PaymentMethod } from './payments'

export { paymentMethods, type PaymentMethod } from './payments'

export type ServiceCategory = 'Manos' | 'Pies' | 'Cejas y pestañas' | 'Depilación' | 'Paquetes'
export type AppointmentStatus = 'pendiente' | 'confirmada' | 'completada'

export interface Service {
  id: string
  name: string
  category: ServiceCategory
  price: number
  /** Minutos */
  duration: number
  description: string
  popular?: boolean
}

export interface Client {
  id: string
  name: string
  phone: string
  since: DateKey
  notes?: string
  favoriteServiceIds: string[]
}

export interface Staff {
  id: string
  name: string
  role: string
}

export interface Payment {
  method: PaymentMethod
  amount: number
  /** Minutos desde medianoche */
  paidAt: number
}

export interface Appointment {
  id: string
  date: DateKey
  /** Minutos desde medianoche */
  start: number
  clientId: string
  serviceId: string
  staffId: string
  status: AppointmentStatus
  payment?: Payment
}

export const OPEN_MINUTE = 8 * 60
export const CLOSE_MINUTE = 18 * 60

export const serviceCategories: ServiceCategory[] = ['Manos', 'Pies', 'Cejas y pestañas', 'Depilación', 'Paquetes']

export const services: Service[] = [
  { id: 'mani-tradicional', name: 'Manicure tradicional', category: 'Manos', price: 6000, duration: 45, description: 'Limado, cutícula, hidratación y esmalte regular.' },
  { id: 'mani-semi', name: 'Manicure semipermanente', category: 'Manos', price: 10000, duration: 60, description: 'Esmalte en gel que dura hasta 3 semanas sin descascararse.', popular: true },
  { id: 'acrilicas', name: 'Uñas acrílicas (set completo)', category: 'Manos', price: 18000, duration: 120, description: 'Extensión en acrílico con la forma y el largo que ella elija.', popular: true },
  { id: 'relleno', name: 'Relleno de acrílico', category: 'Manos', price: 13000, duration: 90, description: 'Mantenimiento recomendado cada 2 a 3 semanas.' },
  { id: 'polygel', name: 'Uñas en polygel', category: 'Manos', price: 16000, duration: 105, description: 'Más livianas y flexibles que el acrílico, acabado natural.' },
  { id: 'nail-art', name: 'Diseño nail art', category: 'Manos', price: 5000, duration: 30, description: 'Decoración a mano alzada, foil, piedras o encapsulado (10 uñas).' },
  { id: 'retiro', name: 'Retiro de gel o acrílico', category: 'Manos', price: 4000, duration: 30, description: 'Retiro cuidadoso sin dañar la uña natural.' },
  { id: 'pedi-tradicional', name: 'Pedicure tradicional', category: 'Pies', price: 8000, duration: 60, description: 'Remojo, exfoliación, cutícula, limado y esmalte regular.' },
  { id: 'pedi-spa', name: 'Pedicure spa semipermanente', category: 'Pies', price: 14000, duration: 75, description: 'Exfoliación, mascarilla, masaje relajante y esmalte en gel.', popular: true },
  { id: 'cejas-diseno', name: 'Diseño de cejas', category: 'Cejas y pestañas', price: 5000, duration: 30, description: 'Perfilado con cera y pinza según la forma del rostro.' },
  { id: 'cejas-henna', name: 'Cejas con henna', category: 'Cejas y pestañas', price: 9000, duration: 45, description: 'Diseño más tinte de henna que rellena y define.' },
  { id: 'laminado', name: 'Laminado de cejas', category: 'Cejas y pestañas', price: 15000, duration: 60, description: 'Cejas peinadas y con volumen hasta por 6 semanas.' },
  { id: 'lifting', name: 'Lifting de pestañas', category: 'Cejas y pestañas', price: 18000, duration: 60, description: 'Curvatura natural con tinte, sin necesidad de rizador.', popular: true },
  { id: 'extensiones', name: 'Extensiones de pestañas clásicas', category: 'Cejas y pestañas', price: 25000, duration: 120, description: 'Una extensión por pestaña natural, efecto rímel.' },
  { id: 'bozo', name: 'Depilación de bozo', category: 'Depilación', price: 3000, duration: 15, description: 'Cera tibia de baja temperatura para piel sensible.' },
  { id: 'axilas', name: 'Depilación de axilas', category: 'Depilación', price: 5000, duration: 20, description: 'Cera elástica, resultado de 3 a 4 semanas.' },
  { id: 'combo', name: 'Combo mani + pedi semipermanente', category: 'Paquetes', price: 22000, duration: 120, description: 'Manos y pies en gel con ahorro de ₡2 000.', popular: true },
  { id: 'novia', name: 'Paquete novia', category: 'Paquetes', price: 38000, duration: 180, description: 'Manicure y pedicure spa, diseño de cejas y prueba de uñas.' },
]

export const staff: Staff[] = [
  { id: 'valeria', name: 'Valeria', role: 'Dueña · uñas y pestañas' },
  { id: 'tatiana', name: 'Tatiana', role: 'Manicurista' },
]

const clientSeeds: Array<Omit<Client, 'since'> & { monthsAgo: number }> = [
  { id: 'c01', name: 'María Fernanda Solís Rojas', phone: '8845-2193', monthsAgo: 26, favoriteServiceIds: ['relleno', 'nail-art'], notes: 'Prefiere tonos nude y forma almendra.' },
  { id: 'c02', name: 'Daniela Vargas Mora', phone: '8712-4408', monthsAgo: 14, favoriteServiceIds: ['mani-semi', 'pedi-spa'] },
  { id: 'c03', name: 'Karla Jiménez Quirós', phone: '6034-7781', monthsAgo: 9, favoriteServiceIds: ['lifting', 'cejas-diseno'], notes: 'Ojos sensibles: usar parches de hidrogel.' },
  { id: 'c04', name: 'Andrea Quesada Brenes', phone: '8890-1256', monthsAgo: 18, favoriteServiceIds: ['acrilicas', 'relleno'] },
  { id: 'c05', name: 'Sofía Chaves Arias', phone: '7015-3369', monthsAgo: 4, favoriteServiceIds: ['mani-semi', 'cejas-henna'], notes: 'Alérgica al látex.' },
  { id: 'c06', name: 'Valentina Araya Méndez', phone: '8321-9074', monthsAgo: 11, favoriteServiceIds: ['polygel', 'nail-art'] },
  { id: 'c07', name: 'Gabriela Castro Umaña', phone: '8456-2210', monthsAgo: 30, favoriteServiceIds: ['combo', 'cejas-diseno'], notes: 'Clienta desde que abrió el local.' },
  { id: 'c08', name: 'Natalia Alvarado Soto', phone: '6178-5532', monthsAgo: 7, favoriteServiceIds: ['pedi-tradicional', 'mani-tradicional'] },
  { id: 'c09', name: 'Melissa Brenes Cordero', phone: '8603-4417', monthsAgo: 13, favoriteServiceIds: ['extensiones', 'laminado'] },
  { id: 'c10', name: 'Paola Zúñiga Herrera', phone: '8834-7720', monthsAgo: 5, favoriteServiceIds: ['acrilicas', 'nail-art'], notes: 'Le gusta llegar 10 minutos antes.' },
  { id: 'c11', name: 'Fabiola Calderón Vega', phone: '7290-1183', monthsAgo: 22, favoriteServiceIds: ['pedi-spa', 'bozo'] },
  { id: 'c12', name: 'Raquel Monge Salazar', phone: '8567-3391', monthsAgo: 3, favoriteServiceIds: ['laminado', 'cejas-henna'] },
  { id: 'c13', name: 'Ana Lucía Villalobos Mora', phone: '8971-6625', monthsAgo: 16, favoriteServiceIds: ['mani-semi', 'retiro'] },
  { id: 'c14', name: 'Mariela Sánchez Ulate', phone: '6255-8840', monthsAgo: 8, favoriteServiceIds: ['relleno', 'axilas'] },
  { id: 'c15', name: 'Jimena Arias Montero', phone: '8419-0372', monthsAgo: 2, favoriteServiceIds: ['combo', 'lifting'], notes: 'Paga siempre por SINPE.' },
]

const serviceWeights: ReadonlyArray<readonly [string, number]> = [
  ['mani-semi', 10], ['acrilicas', 6], ['relleno', 7], ['pedi-spa', 7], ['mani-tradicional', 4],
  ['pedi-tradicional', 3], ['polygel', 3], ['nail-art', 3], ['cejas-diseno', 4], ['cejas-henna', 2],
  ['lifting', 3], ['laminado', 2], ['extensiones', 2], ['bozo', 2], ['combo', 5], ['retiro', 2],
]

const paymentWeights: ReadonlyArray<readonly [PaymentMethod, number]> = [
  ['sinpe', 5],
  ['efectivo', 3],
  ['tarjeta', 2],
]

const serviceById = new Map(services.map((s) => [s.id, s]))
export const getService = (id: string): Service => serviceById.get(id)!
export const getStaff = (id: string): Staff => staff.find((s) => s.id === id) ?? staff[0]

export interface SalonMockData {
  clients: Client[]
  appointments: Appointment[]
  /** Primer y último día con agenda navegable. */
  agendaStart: DateKey
  agendaEnd: DateKey
}

/**
 * Genera datos coherentes alrededor de `today`: historial antiguo de cada clienta,
 * la semana actual completa y la siguiente (con menos reservas, como en la vida real).
 */
export function createSalonMockData(today: DateKey): SalonMockData {
  const agendaStart = startOfWeek(today)
  const agendaEnd = addDays(agendaStart, 13)
  const appointments: Appointment[] = []

  const clients: Client[] = clientSeeds.map(({ monthsAgo, ...seed }) => ({
    ...seed,
    since: addDays(today, -monthsAgo * 30 - 6),
  }))

  // Historial previo a la semana actual: una visita cada 2 a 4 semanas.
  for (const client of clients) {
    const rng = createRng(`hist-${client.id}`)
    let date = addDays(agendaStart, -rng.int(4, 16))
    const visits = rng.int(4, 7)
    for (let i = 0; i < visits && diffDays(client.since, date) >= 0; i++) {
      const serviceId = rng.chance(0.75) ? rng.pick(client.favoriteServiceIds) : rng.weighted(serviceWeights)
      const service = getService(serviceId)
      const start = Math.min(OPEN_MINUTE + rng.int(0, 30) * 15, CLOSE_MINUTE - service.duration)
      appointments.push({
        id: `h-${client.id}-${i}`,
        date,
        start,
        clientId: client.id,
        serviceId,
        staffId: rng.pick(staff).id,
        status: 'completada',
        payment: { method: rng.weighted(paymentWeights), amount: service.price, paidAt: start + service.duration },
      })
      date = addDays(date, -rng.int(14, 28))
    }
  }

  // Agenda de dos semanas. Cada día se reparten clientas empezando por las que hace más no vienen.
  const lastSeen = new Map(clients.map((c) => [c.id, -Infinity]))
  for (let offset = 0; offset < 14; offset++) {
    const date = addDays(agendaStart, offset)
    const rng = createRng(`day-${date}`)
    const diff = diffDays(today, date)
    const isSunday = fromDateKey(date).getDay() === 0
    const target =
      diff === 0 ? rng.int(8, 10) : diff < 0 ? rng.int(5, 7) : diff <= 6 ? rng.int(3, 6) : rng.int(2, 4)
    const count = isSunday && diff !== 0 ? Math.max(2, target - 2) : target

    const cursors = [OPEN_MINUTE + rng.pick([0, 0, 15, 30]), OPEN_MINUTE + rng.pick([30, 45, 60, 90])]
    const gaps = diff > 0 ? [30, 60, 90, 120, 150] : [15, 30, 45, 45, 60, 90]
    const usedToday = new Set<string>()
    let created = 0
    let attempts = 0

    while (created < count && attempts++ < 40) {
      const lane = cursors[0] <= cursors[1] ? 0 : 1
      let service = getService(rng.weighted(serviceWeights))
      if (cursors[lane] + service.duration > CLOSE_MINUTE) {
        service = getService(rng.pick(['cejas-diseno', 'bozo', 'nail-art', 'mani-tradicional']))
        if (cursors[lane] + service.duration > CLOSE_MINUTE) {
          cursors[lane] = Infinity
          if (cursors.every((c) => c === Infinity)) break
          continue
        }
      }

      const candidates = clients
        .filter((c) => !usedToday.has(c.id))
        .sort((a, b) => lastSeen.get(a.id)! - lastSeen.get(b.id)!)
        .slice(0, 4)
      const client = rng.pick(candidates)
      usedToday.add(client.id)
      lastSeen.set(client.id, offset)

      const start = cursors[lane]
      const status: AppointmentStatus =
        diff < 0 || (diff === 0 && start < 11 * 60)
          ? 'completada'
          : rng.chance(diff === 0 ? 0.75 : 0.6)
            ? 'confirmada'
            : 'pendiente'

      appointments.push({
        id: `a-${date}-${created}`,
        date,
        start,
        clientId: client.id,
        serviceId: service.id,
        staffId: staff[lane].id,
        status,
        payment:
          status === 'completada'
            ? { method: rng.weighted(paymentWeights), amount: service.price, paidAt: start + service.duration }
            : undefined,
      })
      cursors[lane] = start + service.duration + rng.pick(gaps)
      created++
    }
  }

  return { clients, appointments, agendaStart, agendaEnd }
}

/**
 * Ingresos de días anteriores a la agenda (incluye clientas que no están en la lista de ejemplo).
 * Se usa para el total del mes y el gráfico de los últimos 7 días.
 */
export function historicalRevenue(date: DateKey): number {
  const rng = createRng(`rev-${date}`)
  const isSunday = fromDateKey(date).getDay() === 0
  return (isSunday ? rng.int(30, 60) : rng.int(62, 118)) * 1000 + rng.pick([0, 500])
}
