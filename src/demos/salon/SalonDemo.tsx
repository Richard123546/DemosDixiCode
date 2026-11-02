import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { DemoLayout } from '../../components/layout/DemoLayout'
import { salonDemo } from '../../data/demos'
import AgendaPage from './AgendaPage'
import CajaPage from './CajaPage'
import ClientasPage from './ClientasPage'
import InicioPage from './InicioPage'
import { SalonProvider } from './SalonContext'
import ServiciosPage from './ServiciosPage'
import { useSalonSearch } from './search'

export default function SalonDemo() {
  // Cambiar la llave vuelve a crear el estado: así funciona "Reiniciar demo".
  const [run, setRun] = useState(0)
  return (
    <SalonProvider key={run}>
      <SalonShell onReset={() => setRun((n) => n + 1)} />
    </SalonProvider>
  )
}

function SalonShell({ onReset }: { onReset: () => void }) {
  const searchItems = useSalonSearch()
  return (
    <DemoLayout
      demo={salonDemo}
      searchItems={searchItems}
      searchPlaceholder="Buscar clienta, servicio, cita…"
      onReset={onReset}
    >
      <Routes>
        <Route index element={<InicioPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="caja" element={<CajaPage />} />
        <Route path="clientas" element={<ClientasPage />} />
        <Route path="servicios" element={<ServiciosPage />} />
        <Route path="*" element={<Navigate to="/salon" replace />} />
      </Routes>
    </DemoLayout>
  )
}
