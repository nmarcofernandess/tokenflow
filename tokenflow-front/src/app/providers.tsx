'use client'

import { NextUIProvider } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [])

  if (!mounted) return null

  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  )
} 