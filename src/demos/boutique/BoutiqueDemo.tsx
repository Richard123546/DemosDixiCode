import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { DemoLayout } from '../../components/layout/DemoLayout'
import { boutiqueDemo } from '../../data/demos'
import AlertasPage from './AlertasPage'
import { BoutiqueProvider } from './BoutiqueContext'
import InicioPage from './InicioPage'
import InventarioPage from './InventarioPage'
import ReportesPage from './ReportesPage'
import { useBoutiqueSearch } from './search'
import VenderPage from './VenderPage'

export default function BoutiqueDemo() {
  // Cambiar la llave vuelve a crear el estado: así funciona "Reiniciar demo".
  const [run, setRun] = useState(0)
  return (
    <BoutiqueProvider key={run}>
      <BoutiqueShell onReset={() => setRun((n) => n + 1)} />
    </BoutiqueProvider>
  )
}

function BoutiqueShell({ onReset }: { onReset: () => void }) {
  const searchItems = useBoutiqueSearch()
  return (
    <DemoLayout
      demo={boutiqueDemo}
      searchItems={searchItems}
      searchPlaceholder="Buscar producto, color, categoría…"
      onReset={onReset}
    >
      <Routes>
        <Route index element={<InicioPage />} />
        <Route path="inventario" element={<InventarioPage />} />
        <Route path="vender" element={<VenderPage />} />
        <Route path="alertas" element={<AlertasPage />} />
        <Route path="reportes" element={<ReportesPage />} />
        <Route path="*" element={<Navigate to="/boutique" replace />} />
      </Routes>
    </DemoLayout>
  )
}
