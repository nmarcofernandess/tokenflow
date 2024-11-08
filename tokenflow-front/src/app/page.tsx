'use client'

import { Layout } from '@/components/Layout'
import { Providers } from './providers'

export default function Home() {
  return (
    <Providers>
      <Layout />
    </Providers>
  )
}
