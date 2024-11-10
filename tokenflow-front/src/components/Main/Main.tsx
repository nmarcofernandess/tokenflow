'use client'

import { Header } from '@/components/Layout/Header'
import { LoadingOverlay } from '@/components/Loading/LoadingOverlay'
import { FilterControls } from '@/components/FilterControls/FilterControls'
import { Chat } from '@/components/Chat/Chat'

export const Main = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="container mx-auto p-6">
          <div className="bg-content1 rounded-large shadow-medium p-6 mb-6">
            <FilterControls />
          </div>
          <Chat />
        </div>
      </div>
      <LoadingOverlay />
    </div>
  )
} 