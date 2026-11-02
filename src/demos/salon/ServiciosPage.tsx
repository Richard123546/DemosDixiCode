import { CalendarPlus, Clock, Star } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { FilterChips } from '../../components/ui/Chips'
import { PageHeader } from '../../components/ui/PageHeader'
import { serviceCategories, services, type ServiceCategory } from '../../data/salon'
import { formatColones, formatDuration } from '../../lib/format'
import { NewAppointmentSheet } from './NewAppointmentSheet'

type Filter = ServiceCategory | 'Todos'

export default function ServiciosPage() {
  const [params] = useSearchParams()
  const [filter, setFilter] = useState<Filter>(() => {
    const category = params.get('categoria')
    return serviceCategories.find((c) => c === category) ?? 'Todos'
  })
  const [bookingService, setBookingService] = useState<string | null>(null)

  const categories = filter === 'Todos' ? serviceCategories : [filter]

  return (
    <>
      <PageHeader title="Servicios" description={`${services.length} servicios · precios con IVA incluido`} />

      <FilterChips
        label="Categorías"
        className="mb-5"
        value={filter}
        onChange={setFilter}
        options={(['Todos', ...serviceCategories] as Filter[]).map((c) => ({ value: c, label: c }))}
      />

      <div key={filter} className="animate-fade-in space-y-8">
        {categories.map((category) => (
          <section key={category}>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">{category}</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 xl:gap-4 2xl:grid-cols-4">
              {services
                .filter((s) => s.category === category)
                .map((service) => (
                  <Card key={service.id} className="group flex flex-col p-4 transition-shadow hover:shadow-raised md:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-slate-900">{service.name}</h3>
                      {service.popular && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-ink">
                          <Star className="size-3 fill-current" />
                          Más pedido
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex-1 text-sm text-slate-500">{service.description}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                        <Clock className="size-4" />
                        {formatDuration(service.duration)}
                      </span>
                      <span className="ml-auto text-lg font-bold text-slate-900 tabular-nums">
                        {formatColones(service.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBookingService(service.id)}
                        aria-label={`Agendar ${service.name}`}
                        className="grid size-9 place-items-center rounded-full bg-accent-soft text-accent transition-colors hover:bg-accent hover:text-white"
                      >
                        <CalendarPlus className="size-4" />
                      </button>
                    </div>
                  </Card>
                ))}
            </div>
          </section>
        ))}
      </div>

      <NewAppointmentSheet
        open={bookingService !== null}
        defaults={{ serviceId: bookingService ?? undefined }}
        onClose={() => setBookingService(null)}
      />
    </>
  )
}
