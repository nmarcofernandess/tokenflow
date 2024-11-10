'use client'

import { NextUIProvider } from '@nextui-org/react'
import { useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  // Detectar tema do sistema
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  )
} 