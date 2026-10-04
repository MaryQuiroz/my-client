'use client'

import dynamic from 'next/dynamic'
import type { ProspectPin } from './ProspectMap'

const ProspectMap = dynamic(() => import('./ProspectMap'), { ssr: false })

export default function ProspectMapClient({ pins }: { pins: ProspectPin[] }) {
  return <ProspectMap pins={pins} />
}
