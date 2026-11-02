import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { DemoLayout } from '../../components/layout/DemoLayout'
import { sodaDemo } from '../../data/demos'
import CierrePage from './CierrePage'
import CocinaPage from './CocinaPage'
import InicioPage from './InicioPage'
import MesasPage from './MesasPage'
import PedidoPage from './PedidoPage'
import { useSodaSearch } from './search'
import { SodaProvider } from './SodaContext'

export default function SodaDemo() {
  // Cambiar la llave vuelve a crear el estado: así funciona "Reiniciar demo".
  const [run, setRun] = useState(0)
  return (
    <SodaProvider key={run}>
      <SodaShell onReset={() => setRun((n) => n + 1)} />
    </SodaProvider>
  )
}

function SodaShell({ onReset }: { onReset: () => void }) {
  const searchItems = useSodaSearch()
  return (
    <DemoLayout demo={sodaDemo} searchItems={searchItems} searchPlaceholder="Buscar plato, mesa, comanda…" onReset={onReset}>
      <Routes>
        <Route index element={<InicioPage />} />
        <Route path="mesas" element={<MesasPage />} />
        <Route path="pedido" element={<PedidoPage />} />
        <Route path="cocina" element={<CocinaPage />} />
        <Route path="cierre" element={<CierrePage />} />
        <Route path="*" element={<Navigate to="/soda" replace />} />
      </Routes>
    </DemoLayout>
  )
}
