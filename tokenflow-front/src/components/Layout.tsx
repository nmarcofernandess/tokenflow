'use client'

import { ExportButton } from './ExportButton'
import { UploadSection } from './UploadSection'
import { FiltersSection } from './FiltersSection'
import { ConversationSidebar } from './ConversationSidebar'
import { ChatView } from './ChatView'
import { Switch, Input } from '@nextui-org/react'
import { IconSun, IconMoon, IconSearch } from '@tabler/icons-react'
import { useState } from 'react'

export const Layout = () => {
  const [isDark, setIsDark] = useState(true)

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle('dark', newTheme)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        {/* 1. Área de Gerenciamento de Arquivos */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <UploadSection />
          </div>
          <div className="flex items-center gap-4">
            <Switch
              defaultSelected={isDark}
              size="lg"
              color="primary"
              startContent={<IconSun size={18} />}
              endContent={<IconMoon size={18} />}
              onChange={toggleTheme}
            />
            <ExportButton />
          </div>
        </div>

        {/* 2. Área de Filtros */}
        <div className="space-y-4">
          {/* Linha 1: Filtros principais */}
          <div className="grid grid-cols-3 gap-4">
            <FiltersSection 
              title="TODAS as tags" 
              operator="AND" 
            />
            <FiltersSection 
              title="QUALQUER tag" 
              operator="OR" 
            />
            <FiltersSection 
              title="Período" 
              type="date" 
            />
          </div>

          {/* Linha 2: Busca unificada */}
          <Input
            type="text"
            placeholder="Buscar em todos os campos..."
            startContent={<IconSearch size={18} />}
            size="lg"
            className="w-full"
          />
        </div>

        {/* 3. Área de Conteúdo */}
        <div className="grid grid-cols-[350px_1fr] gap-6">
          {/* Sidebar com lista de conversas */}
          <div className="h-[calc(100vh-400px)]">
            <ConversationSidebar />
          </div>

          {/* Área principal de visualização */}
          <div className="h-[calc(100vh-400px)]">
            <ChatView />
          </div>
        </div>
      </div>
    </div>
  )
} 