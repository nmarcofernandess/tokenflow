import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'TokenFlow',
  description: 'Gerenciador de conversas com IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className='light'>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
