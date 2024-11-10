'use client'

import { useState } from 'react'
import { Header } from '@/components/Layout/Header'
import { LoadingOverlay } from '@/components/Loading/LoadingOverlay'
import { FilterControls } from '@/components/FilterControls/FilterControls'
import { FileManagement } from '@/components/FileManagement/FileManagement'
import { Chat } from '@/components/Chat/Chat'

export const Main = () => {
  const [isImportOpen, setIsImportOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Header onImportClick={() => setIsImportOpen(!isImportOpen)} />
      <div className="pt-16">
        <div className="container mx-auto p-6">
          {/* Área de Importação */}
          {isImportOpen && (
            <div className="bg-content1 rounded-large shadow-medium p-6 mb-6">
              <FileManagement />
            </div>
          )}
          
          {/* Área de Filtros */}
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