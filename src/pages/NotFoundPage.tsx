import { Link } from 'react-router-dom'
import { Logo } from '../components/ui/Logo'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Logo />
      <h1 className="mt-8 text-2xl font-bold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-slate-500">La dirección que buscás no existe.</p>
      <Link
        to="/"
        className="mt-6 inline-flex h-11 items-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-card hover:bg-indigo-700"
      >
        Ver los demos
      </Link>
    </div>
  )
}
