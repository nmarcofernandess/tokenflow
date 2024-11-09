'use client'

import { Layout } from '@/components/Layout'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { ConversationSidebar } from '@/components/ConversationSidebar'
import { ChatView } from '@/components/ChatView'
import { FilterControls } from '@/components/FilterControls'

export default function Home() {
  return (
    <Layout>
      <div className="pt-16"> {/* Espaço para o header fixo */}
        <div className="container mx-auto p-6">
          {/* Área de Filtros e Controles */}
          <div className="bg-content1 rounded-large shadow-medium p-6 mb-6">
            <FilterControls />
          </div>

          {/* Área de Conteúdo */}
          <div className="grid grid-cols-[350px_1fr] gap-6">
            <ConversationSidebar />
            <ChatView />
          </div>
        </div>
      </div>
      <LoadingOverlay />
    </Layout>
  )
}
