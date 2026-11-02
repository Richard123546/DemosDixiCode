import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

// Cada demo se descarga solo cuando se abre (el de salón trae recharts).
const SalonDemo = lazy(() => import('./demos/salon/SalonDemo'))
const SodaDemo = lazy(() => import('./demos/soda/SodaDemo'))
const BoutiqueDemo = lazy(() => import('./demos/boutique/BoutiqueDemo'))

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-page" />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/salon/*" element={<SalonDemo />} />
        <Route path="/soda/*" element={<SodaDemo />} />
        <Route path="/boutique/*" element={<BoutiqueDemo />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
