import { Metadata } from 'next'
import RoiCalculator from '@/components/shared/RoiCalculator'

export const metadata: Metadata = { title: 'Herramientas — My Client' }

export default function HerramientasPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Herramientas de venta</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Recursos para usar en reuniones con clientes potenciales.
        </p>
      </div>
      <RoiCalculator />
    </div>
  )
}
